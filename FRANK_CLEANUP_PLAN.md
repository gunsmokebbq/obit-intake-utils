# Frank's Zyte Bad Data Cleanup Plan - Execution Plan

## Executive Summary

Frank proposes a 6-step cleanup process to address corrupted data caused by Zyte reusing obituary IDs, which led to incorrect merges between different people's obituaries. The plan involves deleting bad Zyte obits, cleaning up remaining merges, and re-loading the correct Zyte data.

## Root Cause Analysis

### What Happened
1. **Zyte re-used obituary IDs** - Same `source_reference_id` was used for different obituaries
2. **Updates changed names** - Obits changed from "John Doe" to "Mary Poppins" via API updates
3. **Bad merges occurred** - These obits merged with other obits (both correct and incorrect)
4. **Mass unmerge attempted** - Last week a bulk unmerge was run, but:
   - Complex multi-merge scenarios couldn't be fully resolved
   - Some bad merges remain as remnants
   - ~900 records still show name mismatches

### Current State
- **~900 records** with name mismatches between person and obituary names
- Some persons have **4+ merges** that couldn't be properly unmerged
- **Deleted obits** still redirecting to active merged obits with different person names
- **Effective date range**: November 25, 2025 - December 3, 2025 (with 1 week buffer for merge effects)

## Frank's Proposed Solution

### Step 1: Delete All Zyte Obits for Impacted Persons
**Action:**
- Delete all Zyte obituaries (source_id=36) for all persons identified in the impact analysis
- This removes the corrupted data at the source

**Query to Identify:**
```sql
-- All Zyte obits for impacted persons
SELECT o.id, o.person_id, o.source_reference_id
FROM person_obituary o
WHERE o.source_id = 36
  AND o.created_at >= '2025-11-25 00:00:00.000000+00'
  AND o.person_id IN (
    -- All impacted persons from previous analysis
  )
```

**Implementation:**
- Use soft delete (set `deleted` timestamp)
- Or hard delete if appropriate
- **Decision needed:** Soft vs hard delete?

**Risks:**
- ⚠️ **Data Loss Risk**: If we hard delete, we lose the ability to reference what was deleted
- ⚠️ **Cascade Effects**: Need to understand what cascades when obits are deleted
- ⚠️ **Queue Cleanup**: MergeQueue entries, AttributeAutoExtractQueue, etc. may need cleanup

**Gaps:**
- ❓ **Backup Strategy**: Should we export/backup these obits before deletion?
- ❓ **Audit Trail**: How do we track what was deleted for rollback purposes?
- ❓ **Related Data**: What happens to PersonAttributes, Events, Keywords sourced to these obits?

---

### Step 2: Update Person Records Based on Remaining Non-Zyte Obits
**Action:**
- For persons that still have non-Zyte obits after Step 1
- Recalculate and update person record based on remaining obituary data
- This restores correct person names/attributes from the good obits

**Implementation:**
- Need to identify which persons have remaining non-Zyte obits
- Re-run person attribute calculation logic
- Update person.first_name, person.last_name, etc. from best remaining obit

**Query to Identify:**
```sql
-- Persons with remaining non-Zyte obits after Zyte deletion
SELECT DISTINCT p.id, p.first_name, p.last_name
FROM person_person p
INNER JOIN person_obituary o ON o.person_id = p.id
WHERE o.source_id != 36  -- Not Zyte
  AND o.deleted IS NULL
  AND p.id IN (
    -- Impacted persons
  )
```

**Risks:**
- ⚠️ **Attribute Priority Logic**: Need to ensure we use the correct attribute priority (Admin > User > Obituary-sourced)
- ⚠️ **Multiple Obits**: If person has multiple non-Zyte obits, which one's attributes do we use?
- ⚠️ **Incomplete Data**: Some persons may have had ALL their obits from Zyte, leaving them with no data

**Gaps:**
- ❓ **Attribute Recalculation**: Is there existing code/process to recalculate person attributes from obits?
- ❓ **Primary Obituary**: Should we update `person.primary_obituary_id`?
- ❓ **Funeral Home**: What about `person.funeral_home_org_id`?

---

### Step 3: Delete Persons with No Remaining Obits
**Action:**
- Delete any persons that no longer have any obituaries after Step 1
- These are "orphaned" persons that only had Zyte obits

**Query to Identify:**
```sql
-- Persons with no remaining obits
SELECT p.id, p.first_name, p.last_name
FROM person_person p
WHERE p.id IN (
    -- Impacted persons
  )
  AND NOT EXISTS (
    SELECT 1 
    FROM person_obituary o 
    WHERE o.person_id = p.id 
      AND o.deleted IS NULL
  )
```

**Risks:**
- ⚠️ **Cascade Deletes**: Person deletion may cascade to PersonAttributes, Events, Keywords, History
- ⚠️ **Soft Delete**: Should we soft delete or hard delete?
- ⚠️ **History Preservation**: Do we want to preserve history records even if person is deleted?

**Gaps:**
- ❓ **Related Records**: What about PersonAttributes, Events, Keywords - should they be deleted too?
- ❓ **History Records**: Should we preserve person_history records for audit purposes?
- ❓ **UnmergedPersons**: Should we clean up unmerged_persons entries for deleted persons?

---

### Step 4: Re-run Name Mismatch Queries (All Sources, Not Just Zyte)
**Action:**
- Re-run Frank's name mismatch queries but **remove the Zyte filter**
- Look for name mismatches across ALL obituaries, not just Zyte
- This catches "John Doe/Mary Poppins" merges that occurred between newspaper obits that got merged along with bad Zyte data

**Queries to Run:**
1. **Person vs Obituary Name Mismatches** (all sources)
2. **Obituary vs Obituary Name Mismatches** (all sources on same person)

**Modified Query Template:**
```sql
-- Remove Zyte filter, look at all obits created in date range
-- Check for name mismatches between persons and their obits
-- Check for name mismatches between obits on same person
```

**Risks:**
- ⚠️ **False Positives**: Will generate more results, including legitimate name variations
- ⚠️ **Noise**: As Frank mentioned, some will be "same person but different version of name"
- ⚠️ **Manual Review**: Will require manual review to weed out false positives

**Gaps:**
- ❓ **Date Range**: Should we use same date range (Nov 25 - Dec 3 + buffer) or expand?
- ❓ **Name Matching Logic**: How do we handle legitimate name variations (e.g., "Bob" vs "Robert")?
- ❓ **Review Process**: Who reviews the results and how long will it take?

---

### Step 5: Clean Up Bad Merges Found in Step 4
**Action:**
- For each bad merge identified in Step 4, perform manual unmerge/cleanup
- This addresses the remaining bad merges between non-Zyte obits

**Implementation:**
- Use existing unmerge tool/process
- Manual review and cleanup for each identified bad merge
- Document what was fixed

**Risks:**
- ⚠️ **Volume**: Could be many records requiring manual review
- ⚠️ **Time Intensive**: Manual cleanup is slow
- ⚠️ **Unmerge Limitations**: As Frank noted, unmerge "is not designed to handle some of these complex merges"
- ⚠️ **Incomplete Fixes**: Some complex merges may not be fully resolvable

**Gaps:**
- ❓ **Prioritization**: Which bad merges should be fixed first?
- ❓ **Tooling**: Is the unmerge tool sufficient, or do we need additional tooling?
- ❓ **Success Criteria**: How do we verify a merge was properly cleaned up?

---

### Step 6: Re-load Deleted Zyte Obits
**Action:**
- Re-load the Zyte obituaries that were deleted in Step 1
- This should bring in the CORRECT data (assuming Zyte has fixed their data)

**Implementation:**
- Trigger re-ingestion of Zyte obits via their normal process
- Or manually re-publish via API if needed
- Verify the data is correct before re-loading

**Risks:**
- ⚠️ **Data Still Bad**: If Zyte hasn't fixed their data, we'll re-introduce the same problem
- ⚠️ **Re-merge Issues**: If persons were cleaned up, re-loaded obits might auto-merge incorrectly again
- ⚠️ **Timing**: When is it safe to re-load? After all cleanup is complete?

**Gaps:**
- ❓ **Zyte Data Verification**: How do we verify Zyte has fixed their data before re-loading?
- ❓ **Re-ingestion Process**: What's the process to trigger Zyte re-ingestion?
- ❓ **Auto-merge Prevention**: Should we temporarily disable auto-merge for Zyte obits?
- ❓ **Monitoring**: How do we monitor re-loaded obits to ensure they're correct?

---

## Critical Gaps and Risks

### High Priority Gaps

1. **❓ Backup and Rollback Strategy**
   - **Gap**: No mention of backing up data before deletion
   - **Risk**: If something goes wrong, we can't restore
   - **Recommendation**: Export all impacted records to backup before Step 1

2. **❓ Soft Delete vs Hard Delete**
   - **Gap**: Not specified whether to use soft or hard delete
   - **Risk**: Hard delete loses audit trail; soft delete may cause issues
   - **Recommendation**: Use soft delete for obits, document decision for persons

3. **❓ Attribute Recalculation Logic**
   - **Gap**: Step 2 assumes we can recalculate person attributes, but process not defined
   - **Risk**: May not correctly restore person data
   - **Recommendation**: Document/verify the attribute calculation logic before Step 2

4. **❓ Zyte Data Verification**
   - **Gap**: Step 6 doesn't specify how to verify Zyte data is fixed
   - **Risk**: Re-introducing bad data
   - **Recommendation**: Require Zyte to provide verification or test with small batch first

5. **❓ Auto-merge Prevention**
   - **Gap**: No mention of preventing auto-merge during re-load
   - **Risk**: Re-loaded obits might auto-merge incorrectly again
   - **Recommendation**: Temporarily disable auto-merge for Zyte source or add safeguards

### Medium Priority Gaps

6. **❓ Cascade Effects**
   - **Gap**: Not clear what happens to related data (PersonAttributes, Events, Keywords, Queues)
   - **Risk**: Orphaned or incorrect related data
   - **Recommendation**: Document cascade behavior and cleanup requirements

7. **❓ Manual Review Process**
   - **Gap**: Step 4 results need manual review, but process not defined
   - **Risk**: Inconsistent or incomplete review
   - **Recommendation**: Define review criteria and assign reviewers

8. **❓ Success Metrics**
   - **Gap**: No definition of "done" or success criteria
   - **Risk**: Unclear when cleanup is complete
   - **Recommendation**: Define measurable success criteria (e.g., zero name mismatches)

9. **❓ Testing Strategy**
   - **Gap**: No mention of testing on staging/dev first
   - **Risk**: Production issues
   - **Recommendation**: Test full process on staging with sample data first

### Risks

1. **⚠️ Data Loss**
   - Deleting obits and persons could lose data if not properly backed up
   - **Mitigation**: Comprehensive backup before Step 1

2. **⚠️ Incomplete Cleanup**
   - Complex merges may not be fully resolvable
   - **Mitigation**: Accept that some may require manual intervention

3. **⚠️ Re-introduction of Bad Data**
   - If Zyte data isn't fixed, Step 6 re-introduces the problem
   - **Mitigation**: Verify Zyte data before re-loading

4. **⚠️ Performance Impact**
   - Large-scale deletions and updates could impact database performance
   - **Mitigation**: Run during off-peak hours, monitor performance

5. **⚠️ Unmerge Tool Limitations**
   - As Frank noted, unmerge "is not designed to handle some of these complex merges"
   - **Mitigation**: May need manual database fixes for complex cases

---

## Recommended Execution Plan

### Phase 1: Preparation (Before Starting)
1. **Backup All Impacted Data**
   - Export all impacted persons, obituaries, attributes, events, keywords
   - Store in safe location for rollback if needed

2. **Verify Zyte Data Status**
   - Confirm with Zyte that their data is fixed
   - Test with small sample (1-2 obits) before full re-load

3. **Test on Staging**
   - Run full process on staging environment first
   - Verify each step works as expected
   - Document any issues

4. **Define Success Criteria**
   - Zero name mismatches for impacted persons?
   - All Zyte obits re-loaded correctly?
   - No orphaned persons?

5. **Prepare Monitoring**
   - Set up queries to monitor progress
   - Track counts before/after each step

### Phase 2: Execution (Production)

#### Step 1: Delete Zyte Obits
- **Timing**: Off-peak hours
- **Method**: Soft delete (recommended) or hard delete
- **Verification**: Query to confirm deletion
- **Documentation**: Log what was deleted

#### Step 2: Update Person Records
- **Timing**: Immediately after Step 1
- **Method**: Recalculate attributes from remaining obits
- **Verification**: Spot check person names match remaining obits
- **Documentation**: Log what was updated

#### Step 3: Delete Orphaned Persons
- **Timing**: After Step 2
- **Method**: Soft delete (recommended)
- **Verification**: Query to confirm no persons without obits remain
- **Documentation**: Log what was deleted

#### Step 4: Re-run Name Mismatch Queries
- **Timing**: After Step 3
- **Method**: Run modified queries (no Zyte filter)
- **Output**: Generate list for review
- **Documentation**: Export results

#### Step 5: Manual Cleanup
- **Timing**: After Step 4 results reviewed
- **Method**: Manual unmerge/cleanup for each bad merge
- **Verification**: Re-run queries to verify fixes
- **Documentation**: Track what was fixed

#### Step 6: Re-load Zyte Obits
- **Timing**: After Step 5 complete AND Zyte data verified
- **Method**: Trigger re-ingestion or manual API calls
- **Verification**: Spot check re-loaded obits are correct
- **Monitoring**: Watch for auto-merge issues

### Phase 3: Validation (After Execution)
1. **Re-run All Queries**
   - Verify name mismatches are resolved
   - Check for any remaining issues

2. **Spot Checks**
   - Manually review sample of fixed records
   - Verify data looks correct

3. **Monitor for Issues**
   - Watch for new problems
   - Be ready to rollback if needed

---

## Questions for Frank/Team

1. **Soft vs Hard Delete**: Should we use soft delete or hard delete for Steps 1 and 3?

2. **Backup Strategy**: Should we export/backup all impacted data before starting?

3. **Attribute Recalculation**: Is there existing code/process to recalculate person attributes from obits, or do we need to write it?

4. **Zyte Data Verification**: How do we verify Zyte has fixed their data before Step 6?

5. **Auto-merge Prevention**: Should we temporarily disable auto-merge for Zyte obits during re-load?

6. **Testing**: Should we test on staging first, or go straight to production?

7. **Timeline**: What's the expected timeline for this cleanup? How long for manual review in Step 4?

8. **Success Criteria**: What defines "done"? Zero name mismatches? All Zyte obits re-loaded?

9. **Rollback Plan**: If something goes wrong, what's the rollback procedure?

10. **Communication**: Who needs to be notified before/during/after this cleanup?

---

## Additional Recommendations

1. **Create Stored Procedures**: For Steps 1-3, consider creating stored procedures for better control and rollback capability

2. **Batch Processing**: For large volumes, process in batches to avoid performance issues

3. **Audit Logging**: Log all changes to a separate audit table for tracking

4. **Dry Run Mode**: Add a "dry run" mode that shows what would be deleted/updated without actually doing it

5. **Post-Cleanup Monitoring**: Set up ongoing monitoring queries to catch similar issues early

6. **Documentation**: Document the entire process for future reference

7. **Lessons Learned**: After completion, document what went well and what could be improved

