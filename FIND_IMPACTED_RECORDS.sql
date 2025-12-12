-- ============================================================================
-- Queries to Find All Potentially Impacted Records from Bad Source Data
-- ============================================================================
-- These queries help locate all persons and obituaries that may have been
-- affected by bad data that was merged with good data, even after unmerging.
--
-- Bad source_reference_ids:
-- 'zyte-1755917aa6e31d0d', 'zyte-2a15d55cc3d0de03', 'zyte-dbd0ab7681ccc394',
-- 'zyte-f19a35e84614e231', 'zyte-a46bc9dcf589d94b', 'zyte-5f1414f3f0fd289b',
-- 'zyte-11fc6f2c1bca8af8'
-- ============================================================================

-- ============================================================================
-- QUERY 1: Find Initial Bad Obituaries
-- ============================================================================
-- This finds the obituaries that initially came in with the bad source_reference_ids
SELECT 
    o.id AS obituary_id,
    o.person_id,
    o.source_reference_id,
    o.source_id,
    o.owner_id,
    o.provider_id,
    o.publication_begin_date,
    o.publication_end_date,
    o.obituary_type,
    o.deleted,
    o.created_at,
    o.updated_at
FROM person_obituary o
WHERE o.source_reference_id IN (
    'zyte-1755917aa6e31d0d', 
    'zyte-2a15d55cc3d0de03', 
    'zyte-dbd0ab7681ccc394', 
    'zyte-f19a35e84614e231', 
    'zyte-a46bc9dcf589d94b', 
    'zyte-5f1414f3f0fd289b', 
    'zyte-11fc6f2c1bca8af8'
)
ORDER BY o.id;


-- ============================================================================
-- QUERY 2: Find All Persons Associated with Bad Obituaries
-- ============================================================================
-- This finds all persons that are (or were) associated with the bad obituaries
-- Includes both active and deleted persons
SELECT DISTINCT
    p.id AS person_id,
    p.first_name,
    p.last_name,
    p.middle_name,
    p.date_of_birth,
    p.date_of_death,
    p.deleted AS person_deleted,
    p.created_at AS person_created_at,
    p.updated_at AS person_updated_at,
    COUNT(DISTINCT o.id) AS obituary_count
FROM person_person p
INNER JOIN person_obituary o ON o.person_id = p.id
WHERE o.source_reference_id IN (
    'zyte-1755917aa6e31d0d', 
    'zyte-2a15d55cc3d0de03', 
    'zyte-dbd0ab7681ccc394', 
    'zyte-f19a35e84614e231', 
    'zyte-a46bc9dcf589d94b', 
    'zyte-5f1414f3f0fd289b', 
    'zyte-11fc6f2c1bca8af8'
)
GROUP BY p.id, p.first_name, p.last_name, p.middle_name, 
         p.date_of_birth, p.date_of_death, p.deleted, 
         p.created_at, p.updated_at
ORDER BY p.id;


-- ============================================================================
-- QUERY 3: Find All Obituaries for Impacted Persons
-- ============================================================================
-- This finds ALL obituaries (including good ones) that are associated with
-- persons that had the bad obituaries. This is critical because when obits
-- merge, they move to the same person_id.
SELECT 
    o.id AS obituary_id,
    o.person_id,
    o.source_reference_id,
    o.source_id,
    o.owner_id,
    o.provider_id,
    o.publication_begin_date,
    o.publication_end_date,
    o.obituary_type,
    o.deleted AS obituary_deleted,
    o.created_at AS obituary_created_at,
    o.updated_at AS obituary_updated_at,
    CASE 
        WHEN o.source_reference_id IN (
            'zyte-1755917aa6e31d0d', 'zyte-2a15d55cc3d0de03', 
            'zyte-dbd0ab7681ccc394', 'zyte-f19a35e84614e231', 
            'zyte-a46bc9dcf589d94b', 'zyte-5f1414f3f0fd289b', 
            'zyte-11fc6f2c1bca8af8'
        ) THEN 'BAD_OBIT'
        ELSE 'POTENTIALLY_IMPACTED'
    END AS obituary_status
FROM person_obituary o
WHERE o.person_id IN (
    SELECT DISTINCT o2.person_id
    FROM person_obituary o2
    WHERE o2.source_reference_id IN (
        'zyte-1755917aa6e31d0d', 
        'zyte-2a15d55cc3d0de03', 
        'zyte-dbd0ab7681ccc394', 
        'zyte-f19a35e84614e231', 
        'zyte-a46bc9dcf589d94b', 
        'zyte-5f1414f3f0fd289b', 
        'zyte-11fc6f2c1bca8af8'
    )
)
ORDER BY o.person_id, o.id;


-- ============================================================================
-- QUERY 4: Find Persons That Were Merged With Bad Data Persons
-- ============================================================================
-- This finds persons that were merged with the bad data persons by looking
-- at the history table for MERGE_PERSON actions
SELECT DISTINCT
    h.object_key AS merged_to_person_id,
    h.metadata->>'from_person_id' AS merged_from_person_id,
    h.metadata->>'to_person_id' AS merged_to_person_id_alt,
    h.metadata->>'obituary_merge_metadata' AS merge_metadata,
    h.user_id,
    h.created_at AS merge_date,
    p.first_name,
    p.last_name,
    p.deleted AS person_deleted
FROM person_history h
INNER JOIN person_person p ON p.id = h.object_key::integer
WHERE h.action_type = 12  -- MERGE_PERSON
  AND (
      -- Person was merged FROM a bad data person
      (h.metadata->>'from_person_id')::integer IN (
          SELECT DISTINCT o.person_id
          FROM person_obituary o
          WHERE o.source_reference_id IN (
              'zyte-1755917aa6e31d0d', 
              'zyte-2a15d55cc3d0de03', 
              'zyte-dbd0ab7681ccc394', 
              'zyte-f19a35e84614e231', 
              'zyte-a46bc9dcf589d94b', 
              'zyte-5f1414f3f0fd289b', 
              'zyte-11fc6f2c1bca8af8'
          )
      )
      OR
      -- Person was merged TO a bad data person
      (h.metadata->>'to_person_id')::integer IN (
          SELECT DISTINCT o.person_id
          FROM person_obituary o
          WHERE o.source_reference_id IN (
              'zyte-1755917aa6e31d0d', 
              'zyte-2a15d55cc3d0de03', 
              'zyte-dbd0ab7681ccc394', 
              'zyte-f19a35e84614e231', 
              'zyte-a46bc9dcf589d94b', 
              'zyte-5f1414f3f0fd289b', 
              'zyte-11fc6f2c1bca8af8'
          )
      )
  )
ORDER BY h.created_at DESC;


-- ============================================================================
-- QUERY 5: Find Persons That Were Unmerged From Bad Data Persons
-- ============================================================================
-- This finds persons that were unmerged from the bad data persons
-- These are persons that were previously merged but then unmerged
SELECT DISTINCT
    up.person_id,
    up.from_person_id,
    up.note,
    up.created_at AS unmerge_date,
    p1.first_name AS person_first_name,
    p1.last_name AS person_last_name,
    p1.deleted AS person_deleted,
    p2.first_name AS from_person_first_name,
    p2.last_name AS from_person_last_name,
    p2.deleted AS from_person_deleted
FROM person_unmergedpersons up
INNER JOIN person_person p1 ON p1.id = up.person_id
INNER JOIN person_person p2 ON p2.id = up.from_person_id
WHERE up.from_person_id IN (
    SELECT DISTINCT o.person_id
    FROM person_obituary o
    WHERE o.source_reference_id IN (
        'zyte-1755917aa6e31d0d', 
        'zyte-2a15d55cc3d0de03', 
        'zyte-dbd0ab7681ccc394', 
        'zyte-f19a35e84614e231', 
        'zyte-a46bc9dcf589d94b', 
        'zyte-5f1414f3f0fd289b', 
        'zyte-11fc6f2c1bca8af8'
    )
)
   OR up.person_id IN (
    SELECT DISTINCT o.person_id
    FROM person_obituary o
    WHERE o.source_reference_id IN (
        'zyte-1755917aa6e31d0d', 
        'zyte-2a15d55cc3d0de03', 
        'zyte-dbd0ab7681ccc394', 
        'zyte-f19a35e84614e231', 
        'zyte-a46bc9dcf589d94b', 
        'zyte-5f1414f3f0fd289b', 
        'zyte-11fc6f2c1bca8af8'
    )
)
ORDER BY up.created_at DESC;


-- ============================================================================
-- QUERY 6: Find All Potentially Impacted Persons (Comprehensive)
-- ============================================================================
-- This combines all the above to find ALL persons that may have been impacted
-- Includes: initial bad persons, merged persons, and unmerged persons
WITH bad_obit_persons AS (
    SELECT DISTINCT o.person_id
    FROM person_obituary o
    WHERE o.source_reference_id IN (
        'zyte-1755917aa6e31d0d', 
        'zyte-2a15d55cc3d0de03', 
        'zyte-dbd0ab7681ccc394', 
        'zyte-f19a35e84614e231', 
        'zyte-a46bc9dcf589d94b', 
        'zyte-5f1414f3f0fd289b', 
        'zyte-11fc6f2c1bca8af8'
    )
),
merged_persons AS (
    SELECT DISTINCT (h.metadata->>'to_person_id')::integer AS person_id
    FROM person_history h
    WHERE h.action_type = 12  -- MERGE_PERSON
      AND (h.metadata->>'from_person_id')::integer IN (SELECT person_id FROM bad_obit_persons)
    UNION
    SELECT DISTINCT (h.metadata->>'from_person_id')::integer AS person_id
    FROM person_history h
    WHERE h.action_type = 12  -- MERGE_PERSON
      AND (h.metadata->>'to_person_id')::integer IN (SELECT person_id FROM bad_obit_persons)
),
unmerged_persons AS (
    SELECT DISTINCT up.person_id
    FROM person_unmergedpersons up
    WHERE up.from_person_id IN (SELECT person_id FROM bad_obit_persons)
    UNION
    SELECT DISTINCT up.from_person_id AS person_id
    FROM person_unmergedpersons up
    WHERE up.person_id IN (SELECT person_id FROM bad_obit_persons)
),
all_impacted_person_ids AS (
    SELECT person_id FROM bad_obit_persons
    UNION
    SELECT person_id FROM merged_persons
    UNION
    SELECT person_id FROM unmerged_persons
)
SELECT 
    p.id AS person_id,
    p.first_name,
    p.last_name,
    p.middle_name,
    p.date_of_birth,
    p.date_of_death,
    p.deleted AS person_deleted,
    p.created_at AS person_created_at,
    p.updated_at AS person_updated_at,
    CASE 
        WHEN p.id IN (SELECT person_id FROM bad_obit_persons) THEN 'INITIAL_BAD'
        WHEN p.id IN (SELECT person_id FROM merged_persons) THEN 'MERGED_WITH_BAD'
        WHEN p.id IN (SELECT person_id FROM unmerged_persons) THEN 'UNMERGED_FROM_BAD'
        ELSE 'UNKNOWN'
    END AS impact_type,
    COUNT(DISTINCT o.id) AS obituary_count
FROM person_person p
INNER JOIN all_impacted_person_ids aip ON aip.person_id = p.id
LEFT JOIN person_obituary o ON o.person_id = p.id AND o.deleted IS NULL
GROUP BY p.id, p.first_name, p.last_name, p.middle_name, 
         p.date_of_birth, p.date_of_death, p.deleted, 
         p.created_at, p.updated_at
ORDER BY p.id;


-- ============================================================================
-- QUERY 7: Find Name Mismatches Between Persons and Their Obituaries
-- ============================================================================
-- This finds cases where the person's name doesn't match the obituary's
-- name attributes, which could indicate corruption from merging
WITH bad_obit_persons AS (
    SELECT DISTINCT o.person_id
    FROM person_obituary o
    WHERE o.source_reference_id IN (
        'zyte-1755917aa6e31d0d', 
        'zyte-2a15d55cc3d0de03', 
        'zyte-dbd0ab7681ccc394', 
        'zyte-f19a35e84614e231', 
        'zyte-a46bc9dcf589d94b', 
        'zyte-5f1414f3f0fd289b', 
        'zyte-11fc6f2c1bca8af8'
    )
),
impacted_persons AS (
    -- Get all persons that had bad obits
    SELECT DISTINCT person_id FROM bad_obit_persons
    UNION
    -- Get all persons that were merged with bad persons
    SELECT DISTINCT (h.metadata->>'to_person_id')::integer AS person_id
    FROM person_history h
    WHERE h.action_type = 12
      AND (h.metadata->>'from_person_id')::integer IN (SELECT person_id FROM bad_obit_persons)
    UNION
    SELECT DISTINCT (h.metadata->>'from_person_id')::integer AS person_id
    FROM person_history h
    WHERE h.action_type = 12
      AND (h.metadata->>'to_person_id')::integer IN (SELECT person_id FROM bad_obit_persons)
)
SELECT 
    p.id AS person_id,
    p.first_name AS person_first_name,
    p.last_name AS person_last_name,
    o.id AS obituary_id,
    o.source_reference_id,
    pan.first_name AS obit_first_name,
    pan.last_name AS obit_last_name,
    CASE 
        WHEN UPPER(TRIM(p.first_name)) != UPPER(TRIM(pan.first_name)) 
          OR UPPER(TRIM(p.last_name)) != UPPER(TRIM(pan.last_name)) 
        THEN 'MISMATCH'
        ELSE 'MATCH'
    END AS name_match_status
FROM person_person p
INNER JOIN impacted_persons ip ON ip.person_id = p.id
INNER JOIN person_obituary o ON o.person_id = p.id AND o.deleted IS NULL
INNER JOIN person_personattribute ppa ON ppa.person_id = p.id AND ppa.deleted IS NULL
INNER JOIN person_personattributename pan ON pan.person_attribute_id = ppa.id
INNER JOIN person_attribute pa ON pa.id = ppa.attribute_id
WHERE pa.name = 'person_name'  -- Assuming this is the attribute name for person name
  AND (
      UPPER(TRIM(COALESCE(p.first_name, ''))) != UPPER(TRIM(COALESCE(pan.first_name, '')))
      OR UPPER(TRIM(COALESCE(p.last_name, ''))) != UPPER(TRIM(COALESCE(pan.last_name, '')))
  )
ORDER BY p.id, o.id;


-- ============================================================================
-- QUERY 8: Find All Obituaries for Impacted Persons (Final Comprehensive List)
-- ============================================================================
-- This is the final query to get ALL obituaries that need to be reviewed
-- for all impacted persons
WITH bad_obit_persons AS (
    SELECT DISTINCT o.person_id
    FROM person_obituary o
    WHERE o.source_reference_id IN (
        'zyte-1755917aa6e31d0d', 
        'zyte-2a15d55cc3d0de03', 
        'zyte-dbd0ab7681ccc394', 
        'zyte-f19a35e84614e231', 
        'zyte-a46bc9dcf589d94b', 
        'zyte-5f1414f3f0fd289b', 
        'zyte-11fc6f2c1bca8af8'
    )
),
merged_persons AS (
    SELECT DISTINCT (h.metadata->>'to_person_id')::integer AS person_id
    FROM person_history h
    WHERE h.action_type = 12
      AND (h.metadata->>'from_person_id')::integer IN (SELECT person_id FROM bad_obit_persons)
    UNION
    SELECT DISTINCT (h.metadata->>'from_person_id')::integer AS person_id
    FROM person_history h
    WHERE h.action_type = 12
      AND (h.metadata->>'to_person_id')::integer IN (SELECT person_id FROM bad_obit_persons)
),
unmerged_persons AS (
    SELECT DISTINCT up.person_id
    FROM person_unmergedpersons up
    WHERE up.from_person_id IN (SELECT person_id FROM bad_obit_persons)
    UNION
    SELECT DISTINCT up.from_person_id AS person_id
    FROM person_unmergedpersons up
    WHERE up.person_id IN (SELECT person_id FROM bad_obit_persons)
),
all_impacted_person_ids AS (
    SELECT person_id FROM bad_obit_persons
    UNION
    SELECT person_id FROM merged_persons
    UNION
    SELECT person_id FROM unmerged_persons
)
SELECT 
    o.id AS obituary_id,
    o.person_id,
    o.source_reference_id,
    o.source_id,
    o.owner_id,
    o.provider_id,
    o.publication_begin_date,
    o.publication_end_date,
    o.obituary_type,
    o.deleted AS obituary_deleted,
    o.created_at AS obituary_created_at,
    o.updated_at AS obituary_updated_at,
    p.first_name AS person_first_name,
    p.last_name AS person_last_name,
    CASE 
        WHEN o.source_reference_id IN (
            'zyte-1755917aa6e31d0d', 'zyte-2a15d55cc3d0de03', 
            'zyte-dbd0ab7681ccc394', 'zyte-f19a35e84614e231', 
            'zyte-a46bc9dcf589d94b', 'zyte-5f1414f3f0fd289b', 
            'zyte-11fc6f2c1bca8af8'
        ) THEN 'BAD_OBIT'
        WHEN o.person_id IN (SELECT person_id FROM bad_obit_persons) THEN 'ON_BAD_PERSON'
        WHEN o.person_id IN (SELECT person_id FROM merged_persons) THEN 'ON_MERGED_PERSON'
        WHEN o.person_id IN (SELECT person_id FROM unmerged_persons) THEN 'ON_UNMERGED_PERSON'
        ELSE 'POTENTIALLY_IMPACTED'
    END AS impact_status
FROM person_obituary o
INNER JOIN all_impacted_person_ids aip ON aip.person_id = o.person_id
LEFT JOIN person_person p ON p.id = o.person_id
ORDER BY o.person_id, o.id;

