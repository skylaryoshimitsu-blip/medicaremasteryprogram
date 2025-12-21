/*
  # Insert Exam A Questions 51-75
*/

DO $$
DECLARE
  v_version_a uuid;
BEGIN
  SELECT id INTO v_version_a FROM exam_versions WHERE version_letter = 'A';

  INSERT INTO exam_questions (version_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
  (v_version_a, 51, 'Which plan type replaces Original Medicare?', 'Medigap', 'Part D', 'Part C', 'Employer coverage', 'C'),
  (v_version_a, 52, 'MA plans may charge:', 'Unlimited premiums', 'Separate medical & drug premiums', '$0 premiums', 'Securities fees', 'C'),
  (v_version_a, 53, 'The OEP runs from:', 'Jan 1–Mar 31', 'Apr 1–Jun 30', 'Jul 1–Dec 31', 'Feb 1–May 1', 'A'),
  (v_version_a, 54, 'SEP for moving out of service area lasts:', '1 month', '2 months', '3 months', '6 months', 'B'),
  (v_version_a, 55, 'Which drug tier includes the most expensive drugs?', 'Tier 1', 'Tier 2', 'Tier 3', 'Specialty tier', 'D'),
  (v_version_a, 56, 'Hospice under Medicare is covered by:', 'Part A', 'Part B', 'Both', 'Part D', 'A'),
  (v_version_a, 57, 'The MOOP applies to:', 'Original Medicare', 'MA plans', 'Part D', 'Medigap', 'B'),
  (v_version_a, 58, 'What is IRMAA based on?', 'Savings', 'Assets', 'MAGI from 2 years prior', 'Enrollment year', 'C'),
  (v_version_a, 59, 'Under Part B, beneficiaries typically pay:', 'No premiums', 'A monthly premium', 'Annual premium only', 'Income tax fees', 'B'),
  (v_version_a, 60, 'When can someone enroll in Part D?', 'Only at age 65', 'During IEP or AEP', 'Only after retirement', 'Anytime', 'B'),
  (v_version_a, 61, 'Medicare Supplement Plan G covers:', 'Part B deductible', 'Part A deductible', 'Part D', 'Dental', 'B'),
  (v_version_a, 62, 'Which part of Medicare covers preventive services?', 'A', 'B', 'C', 'D', 'B'),
  (v_version_a, 63, 'The donut hole applies to:', 'Part A', 'Part B', 'Part C', 'Part D', 'D'),
  (v_version_a, 64, 'MA plans must include a:', 'MOOP limit', 'PPO network', 'HMO network', 'Dental plan', 'A'),
  (v_version_a, 65, 'Coordination of Benefits rules are designed to:', 'Increase premiums', 'Determine payment order', 'Eliminate coverage', 'Reduce benefits', 'B'),
  (v_version_a, 66, 'The MAC is:', 'Medicare Advantage center', 'Medicare Administrative Contractor', 'Medicaid Agent Committee', 'Market Analysis Code', 'B'),
  (v_version_a, 67, 'What is the typical law governing Medicare marketing?', 'MACRA', 'CMS guidelines', 'ERISA', 'HIPAA', 'B'),
  (v_version_a, 68, 'What form documents the client''s permission to discuss plans?', 'AOR', 'Scope of Appointment', 'HIPAA form', 'Claim form', 'B'),
  (v_version_a, 69, 'SEP for loss of employer coverage is:', '2 months', '6 months', '8 months', '12 months', 'C'),
  (v_version_a, 70, 'LIS helps with:', 'Medicare Advantage', 'Prescription drug costs', 'Hospital costs', 'Dental coverage', 'B'),
  (v_version_a, 71, 'Medicare Savings Programs (QMB, SLMB, QI) help pay for:', 'Part D drugs only', 'Medigap premiums', 'Medicare premiums and cost-sharing', 'Dental coverage', 'C'),
  (v_version_a, 72, 'What does QMB cover?', 'Part B premium only', 'Part A deductible only', 'All Medicare cost-sharing for eligible low-income beneficiaries', 'Vision and dental', 'C'),
  (v_version_a, 73, 'The Medicare Supplement Open Enrollment Period begins when a beneficiary:', 'Turns 65 AND has Part B', 'Retires', 'Enrolls in Part D', 'Loses Medicaid', 'A'),
  (v_version_a, 74, 'A Medigap policy cannot be sold to someone enrolled in:', 'Original Medicare', 'Part D', 'Medicare Advantage', 'Medicaid', 'C'),
  (v_version_a, 75, 'What is the main advantage of Medigap over Medicare Advantage?', 'Lower premium', 'Nationwide coverage without networks', 'Free dental', 'Free drug coverage', 'B')
  ON CONFLICT (version_id, question_number) DO NOTHING;

END $$;
