# Obituary Merge Process - Database Tables and Functions

## Overview

The obituary merge process combines multiple obituaries and persons that represent the same deceased individual. This document outlines the database tables and operations involved.

## Core Database Tables

### 1. `person_person` (Person Table)

**Purpose:** Stores the main person/deceased record

**Key Fields:**
- `id` - Primary key
- `first_name`, `last_name`, `middle_name` - Name fields
- `date_of_birth`, `date_of_death` - Date fields
- `primary_obituary_id` - Foreign key to the primary obituary
- `funeral_home_org_id` - Foreign key to funeral home organization
- `created_at`, `updated_at` - Timestamps
- `deleted` - Soft delete flag (SafeDelete)

**Role in Merge:**
- Two Person records are merged into one
- The "from_person" is soft-deleted
- The "to_person" receives all obituaries, attributes, events, and keywords from the from_person

### 2. `person_obituary` (Obituary Table)

**Purpose:** Stores individual obituary records

**Key Fields:**
- `id` - Primary key
- `person_id` - Foreign key to Person (can be updated during merge)
- `source_id` - Foreign key to Source
- `source_reference_id` - Reference ID from the source system
- `owner_id`, `provider_id` - Organization foreign keys
- `owner_reference_id`, `provider_reference_id` - Reference IDs
- `obituary_text` - The obituary content
- `template_obituary_text` - Template version
- `publication_begin_date`, `publication_end_date` - Publication dates
- `obituary_type` - Paid/Free/Memoriam
- `source_metadata` - JSON field with additional metadata
- `settings` - JSON field with obituary settings
- `deleted` - Soft delete flag

**Indexes:**
- `screener_app_obit_source_idx` on (`source_id`, `source_reference_id`)
- `screener_app_obit_prov_ref_idx` on (`provider_id`, `provider_reference_id`)
- `screener_app_obit_owner_idx` on (`owner_id`, `owner_reference_id`)

**Role in Merge:**
- Obituaries can be merged in two ways:
  1. **Obituary into Obituary** - Two obituaries from same source merge into one (from_obit is deleted)
  2. **Obituary into Person** - Obituary moves to different person (person_id updated, obit kept)

### 3. `person_mergequeue` (Merge Queue Table)

**Purpose:** Queues obituaries that need manual merge review

**Key Fields:**
- `id` - Primary key
- `obituary_id` - OneToOne relationship with Obituary
- `last_potential_merge_person_id` - Tracks which person was last reviewed
- `last_potential_merge_obituary_id` - Tracks which obituary was last reviewed
- Inherits from `Queue` base class (lock_user, lock_time, etc.)

**Role in Merge:**
- Obituaries are added to queue when potential matches are found
- Users review and manually merge from this queue
- Auto-merge can also process items from queue

### 4. `person_unmergedpersons` (Unmerged Persons Table)

**Purpose:** Tracks persons that have been explicitly unmerged (should not be merged again)

**Key Fields:**
- `id` - Primary key
- `person_id` - Person who was unmerged
- `from_person_id` - Person they were unmerged from
- `note` - Optional note about the unmerge
- `created_at` - Timestamp

**Role in Merge:**
- Prevents re-merging persons that were previously unmerged
- Used in SQL query to disqualify merge candidates:
  ```sql
  SELECT person_id FROM person_unmergedpersons WHERE from_person_id = %s
  UNION
  SELECT from_person_id FROM person_unmergedpersons WHERE person_id = %s
  ```

### 5. `person_personattribute` (Person Attributes Table)

**Purpose:** Stores attributes about the person (name, dates, funeral home, etc.)

**Key Fields:**
- `id` - Primary key
- `person_id` - Foreign key to Person
- `attribute_id` - Foreign key to Attribute (defines attribute type)
- `source_obituary_id` - Foreign key to Obituary (if attribute came from obit)
- `organization_id` - For organization attributes (funeral home)
- `raw_value` - String value
- `datetime_value` - Date/datetime value
- `source_type` - Where attribute came from (Admin, User, System, etc.)
- `deleted` - Soft delete flag

**Role in Merge:**
- Attributes from from_person are moved/merged to to_person
- Attributes are merged based on source_type priority
- Admin/User attributes are preserved, obituary-sourced attributes may be overwritten

### 6. `person_personattributename` (Person Attribute Name Table)

**Purpose:** Stores name components for name attributes

**Key Fields:**
- `id` - Primary key
- `person_attribute_id` - Foreign key to PersonAttribute
- `first_name`, `last_name`, `middle_name` - Name components
- `nickname`, `maiden_name`, `prefix`, `suffix` - Additional name fields

**Role in Merge:**
- Used in merge candidate matching (SQL query matches on first/last name)
- Name attributes are merged along with PersonAttribute records

### 7. `person_event` (Event Table)

**Purpose:** Stores funeral events (wake, service, etc.)

**Key Fields:**
- `id` - Primary key
- `person_id` - Foreign key to Person
- `source_obituary_id` - Foreign key to Obituary (if event came from obit)
- `event_type` - Type of event
- `start_date`, `end_date` - Event dates
- `start_time`, `end_time` - Event times
- `location_id` - Foreign key to Location
- `source_type` - Where event came from
- `deleted` - Soft delete flag

**Role in Merge:**
- Events from from_person are moved to to_person
- Duplicate events may be deleted if they match existing events

### 8. `person_personkeyword` (Person Keywords Table)

**Purpose:** Stores keywords/tags associated with the person

**Key Fields:**
- `id` - Primary key
- `person_id` - Foreign key to Person
- `source_obituary_id` - Foreign key to Obituary
- `keyword` - The keyword text
- `source_type` - Where keyword came from
- `deleted` - Soft delete flag

**Role in Merge:**
- Keywords from from_person are moved to to_person
- Admin keywords are preserved, obituary-sourced keywords may be merged

### 9. `person_history` (History Table)

**Purpose:** Tracks all changes/actions for audit trail

**Key Fields:**
- `id` - Primary key
- `object_key` - ID of the object (person_id or obituary_id)
- `action_type` - Type of action (MERGE_PERSON, DELETE_OBITUARY, etc.)
- `user_id` - Foreign key to User who performed action
- `metadata` - JSON field with action details
- `created_at` - Timestamp

**Action Types Related to Merge:**
- `MERGE_PERSON` (12) - Records person merge
- `UNMERGE_PERSON` (15) - Records person unmerge
- `DELETE_OBITUARY` - Records obituary deletion during merge
- `MERGE_QUEUE_REVIEW` (18) - Records merge queue review
- `MANUAL_MERGE` (19) - Records manual merge action

**Role in Merge:**
- Creates history records before and after merge
- Stores snapshots of person state (pre-merge and post-merge)
- Tracks merge metadata (which obituaries were merged, etc.)

## SQL Query for Finding Merge Candidates

### `SQL_POTENTIAL_OBITS_FOR_MERGE`

**Location:** `person/domain/obituary/potential_merge.py`

**Purpose:** Finds potential obituaries that could be merged with a given obituary

**Key Logic:**
1. Matches on first name and last name (case-insensitive LIKE)
2. Optionally matches on middle name (for ADN obituaries)
3. Checks publication date window (±7 days)
4. Excludes already deleted obituaries
5. Excludes obituaries from same person
6. Excludes certain obituary types
7. Joins with PersonAttribute and PersonAttributeName for name matching
8. Includes funeral home, date of birth, date of death information
9. Orders by owner preference and creation date

**Tables Used:**
- `person_obituary`
- `person_personattribute`
- `person_personattributename`
- `organization_organization` (for funeral home)

## Merge Process Operations

### 1. Finding Merge Candidates

**Function:** `get_merge_obituaries_for_obituary()`

**Process:**
1. Extracts attributes from the obituary (name, dates, etc.)
2. Checks for auto-merge candidates (same legacydb_guestbook_id)
3. Runs SQL query to find potential matches
4. Filters out previously unmerged persons
5. Returns auto-merge candidates and manual-merge candidates

### 2. Executing Merge

**Class:** `Merger` in `person/domain/obituary/merge.py`

**Main Method:** `merge()`

**Database Operations (in transaction):**

1. **Merge Events:**
   - Updates `person_event.person_id` from from_person to to_person
   - Deletes duplicate events if they match existing events

2. **Merge Obituary:**
   - **If same source:** `_merge_obit_into_obit()`
     - Updates `person_obituary` fields (text, dates, metadata)
     - Updates `person_obituary.person_id` on from_obit
     - Soft deletes from_obit
   - **If different source:** `_merge_obit_into_person()`
     - Updates `person_obituary.person_id` from from_person to to_person
     - Merges attributes and keywords

3. **Merge Remaining Person:**
   - Merges all remaining obituaries from from_person
   - Merges attributes not associated with obituaries
   - Merges keywords not associated with obituaries
   - Soft deletes from_person

4. **Update Unmerged Persons:**
   - Calls `UnmergedPersons.copy_to_merged_person()`
   - Updates `person_unmergedpersons` table to track merge relationships

5. **Create History Records:**
   - Creates `person_history` record with:
     - Pre-merge snapshots (from_person and to_person)
     - Post-merge snapshot (merged person)
     - Merge metadata (which obituaries were merged)

### 3. Attribute Merging

**Method:** `_merge_attributes_into_obit()` and `_merge_attributes_not_associated_to_obits()`

**Operations:**
- Updates `person_personattribute.person_id` from from_person to to_person
- Deletes obituary-sourced attributes that conflict with Admin/User attributes
- Updates attributes that were edited but originated from partner sources
- Preserves Admin and User-fielded attributes

### 4. Keyword Merging

**Method:** `_merge_keywords_into_obit()` and `_merge_keywords_not_associated_to_obits()`

**Operations:**
- Updates `person_personkeyword.person_id` from from_person to to_person
- Deletes obituary-sourced keywords that conflict with Admin keywords
- Updates keywords that were edited but originated from Rosette/AI
- Preserves Admin keywords

## Stored Functions/Procedures

**Note:** The codebase uses Django ORM and raw SQL queries, but **does not appear to use database stored procedures or functions**. All merge logic is implemented in Python code.

The main SQL used is:
- `SQL_POTENTIAL_OBITS_FOR_MERGE` - Raw SQL query for finding merge candidates
- `SQL_MERGE_DISQUALIFIERS_DUE_TO_UNMERGES` - Raw SQL query for finding unmerged persons

## Key Relationships

```
Person (1) ──< (Many) Obituary
Person (1) ──< (Many) PersonAttribute
PersonAttribute (1) ──< (1) PersonAttributeName (for name attributes)
Person (1) ──< (Many) Event
Person (1) ──< (Many) PersonKeyword
Obituary (1) ──< (1) MergeQueue
Person (Many) ──< (Many) UnmergedPersons (many-to-many via junction table)
```

## Merge Types

1. **Auto Merge:**
   - Automatically merges when exact match found (same legacydb_guestbook_id)
   - Or when strong match found (name + date match)

2. **Manual Merge:**
   - User reviews potential matches from MergeQueue
   - User selects which person/obituary to merge into
   - Can merge obituary into obituary or obituary into person

3. **Obituary into Obituary:**
   - Both obituaries from same source
   - From obituary content merged into to obituary
   - From obituary is soft-deleted

4. **Obituary into Person:**
   - Obituaries from different sources
   - Obituary moved to different person
   - Both obituaries kept (not deleted)

## Summary

**Primary Tables:**
- `person_person` - Main person records
- `person_obituary` - Obituary records
- `person_mergequeue` - Queue for manual merge review
- `person_unmergedpersons` - Tracks unmerged relationships
- `person_personattribute` - Person attributes
- `person_personattributename` - Name components
- `person_event` - Funeral events
- `person_personkeyword` - Keywords
- `person_history` - Audit trail

**No Stored Procedures:** All merge logic is in Python code using Django ORM and raw SQL queries.

**Key SQL Queries:**
- `SQL_POTENTIAL_OBITS_FOR_MERGE` - Finds merge candidates
- `SQL_MERGE_DISQUALIFIERS_DUE_TO_UNMERGES` - Finds unmerged persons

