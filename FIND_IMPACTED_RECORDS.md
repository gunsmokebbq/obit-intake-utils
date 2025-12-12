# Finding Impacted Records from Bad Source Data

## Overview

This document provides SQL queries to identify all persons and obituaries that may have been impacted by bad data that was received via the obit-intake API and subsequently merged with good data.

## Problem Scenario

- Bad data was received with corrupted names, funeral homes, images, and other data
- The bad obituaries merged with good obituaries, spreading the corruption
- An unmerge was attempted, but some person-obituary associations remain with mismatched names

## Bad Source Reference IDs

The following `source_reference_id` values identify the initial bad records:

- `zyte-1755917aa6e31d0d`
- `zyte-2a15d55cc3d0de03`
- `zyte-dbd0ab7681ccc394`
- `zyte-f19a35e84614e231`
- `zyte-a46bc9dcf589d94b`
- `zyte-5f1414f3f0fd289b`
- `zyte-11fc6f2c1bca8af8`

## Query Strategy

The queries follow this strategy:

1. **Find Initial Bad Obituaries** - Start with the known bad `source_reference_id`s
2. **Find Associated Persons** - Find all persons linked to those obituaries
3. **Find All Obituaries for Those Persons** - When obits merge, they share the same `person_id`
4. **Find Merged Persons** - Check history table for persons that were merged with bad persons
5. **Find Unmerged Persons** - Check unmerged_persons table for persons that were unmerged
6. **Find Name Mismatches** - Identify cases where person names don't match obituary names
7. **Comprehensive Impact List** - Combine all above to get final list

## Query Descriptions

### Query 1: Initial Bad Obituaries
Finds the obituaries that initially came in with the bad `source_reference_id`s.

**Use Case:** Identify the starting point of the bad data.

### Query 2: Persons Associated with Bad Obituaries
Finds all persons that are (or were) associated with the bad obituaries.

**Use Case:** Identify the persons that directly received the bad data.

### Query 3: All Obituaries for Impacted Persons
Finds ALL obituaries (including good ones) that are associated with persons that had the bad obituaries.

**Use Case:** Critical query - when obits merge, they move to the same `person_id`, so good obits may now be on persons that had bad obits.

### Query 4: Persons That Were Merged With Bad Data Persons
Finds persons that were merged with the bad data persons by looking at the history table for `MERGE_PERSON` actions.

**Use Case:** Identifies persons that were merged with bad persons, even if they were later unmerged.

### Query 5: Persons That Were Unmerged From Bad Data Persons
Finds persons that were unmerged from the bad data persons.

**Use Case:** Identifies persons that were previously merged but then unmerged - these may still have residual issues.

### Query 6: All Potentially Impacted Persons (Comprehensive)
Combines all the above to find ALL persons that may have been impacted.

**Use Case:** Master list of all potentially impacted persons with their impact type.

### Query 7: Name Mismatches Between Persons and Obituaries
Finds cases where the person's name doesn't match the obituary's name attributes.

**Use Case:** Identifies specific corruption - when person names don't match obituary names, it indicates data corruption from merging.

**Note:** This query assumes the person name attribute is called `'person_name'`. You may need to adjust this based on your actual attribute name.

### Query 8: All Obituaries for Impacted Persons (Final Comprehensive List)
Final query to get ALL obituaries that need to be reviewed for all impacted persons.

**Use Case:** Master list of all obituaries that need review, with impact status.

## Usage Instructions

1. **Start with Query 1** to verify you can find the initial bad obituaries
2. **Run Query 8** to get the comprehensive list of all obituaries that need review
3. **Run Query 6** to get the comprehensive list of all persons that need review
4. **Run Query 7** to find specific name mismatches (adjust attribute name if needed)
5. **Use Queries 2-5** for detailed investigation of specific relationships

## Important Notes

### Soft Deletes
The queries include both active and deleted records where relevant. The `deleted` field is included in the results so you can filter as needed.

### History Table
The history table uses `action_type = 12` for `MERGE_PERSON` actions. The metadata is stored as JSON, so we extract person IDs using JSON operators.

### Unmerged Persons Table
The `person_unmergedpersons` table tracks bidirectional relationships, so we check both `person_id` and `from_person_id`.

### Attribute Name
Query 7 assumes the person name attribute is called `'person_name'`. You may need to check your `person_attribute` table to find the correct attribute name. You can find it with:

```sql
SELECT DISTINCT pa.name 
FROM person_attribute pa
INNER JOIN person_personattribute ppa ON ppa.attribute_id = pa.id
INNER JOIN person_personattributename pan ON pan.person_attribute_id = ppa.id
WHERE pan.first_name IS NOT NULL OR pan.last_name IS NOT NULL;
```

### Performance Considerations
These queries may be slow on large datasets. Consider:
- Adding indexes if needed
- Running during off-peak hours
- Breaking into smaller batches if necessary

## Next Steps

After identifying impacted records:

1. **Review the results** to understand the scope of impact
2. **Identify patterns** - are certain sources or time periods more affected?
3. **Plan remediation** - decide how to fix the corrupted data
4. **Validate fixes** - re-run queries to verify cleanup

## Example: Finding Attribute Name

If Query 7 doesn't work, first find the correct attribute name:

```sql
-- Find the attribute name for person names
SELECT DISTINCT 
    pa.id,
    pa.name,
    COUNT(*) as usage_count
FROM person_attribute pa
INNER JOIN person_personattribute ppa ON ppa.attribute_id = pa.id
INNER JOIN person_personattributename pan ON pan.person_attribute_id = ppa.id
WHERE pan.first_name IS NOT NULL 
   OR pan.last_name IS NOT NULL
GROUP BY pa.id, pa.name
ORDER BY usage_count DESC;
```

Then update Query 7 to use the correct attribute name.

