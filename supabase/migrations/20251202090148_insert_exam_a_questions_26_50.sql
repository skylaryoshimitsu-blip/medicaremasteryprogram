/*
  # Insert Exam A Questions 26-50
*/

DO $$
DECLARE
  v_version_a uuid;
BEGIN
  SELECT id INTO v_version_a FROM exam_versions WHERE version_letter = 'A';

  INSERT INTO exam_questions (version_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
  (v_version_a, 26, 'The cost an insured must pay before insurance begins is the:', 'Copay', 'Deductible', 'Coinsurance', 'Rider', 'B'),
  (v_version_a, 27, 'Coinsurance represents:', 'Fixed dollar amount', 'Monthly premium', 'Shared percentage of cost', 'Tax penalty', 'C'),
  (v_version_a, 28, 'Which of the following is NOT a characteristic of insurance?', 'Transfer of risk', 'Indemnification', 'Pure risk', 'Speculative risk', 'D'),
  (v_version_a, 29, 'STARR is a method of handling risk. The "R" stands for:', 'Reduction', 'Retention', 'Reinsurance', 'Replacement', 'B'),
  (v_version_a, 30, 'Which type of insurer is owned by policyholders?', 'Stock insurer', 'Mutual insurer', 'Fraternal', 'Lloyd''s', 'B'),
  (v_version_a, 31, 'Disability income replaces:', 'Medical bills', 'Lost income', 'LTC costs', 'Deductibles', 'B'),
  (v_version_a, 32, '"Own occupation" means the insured:', 'Can''t perform any job', 'Cannot perform their specific job', 'Must be unable to work at all', 'Is retired', 'B'),
  (v_version_a, 33, 'Which period begins BEFORE disability benefits are paid?', 'Benefit period', 'Elimination period', 'Trial period', 'Waiting period', 'B'),
  (v_version_a, 34, 'Social Security disability has a waiting period of:', '5 days', '30 days', '5 months', '12 months', 'C'),
  (v_version_a, 35, 'A disability that prevents working ANY job is:', 'Partial', 'Residual', 'Own-occ', 'Any-occ', 'D'),
  (v_version_a, 36, 'Group health insurance is typically:', 'Individually rated', 'Community-rated', 'Higher cost', 'Underwritten individually', 'B'),
  (v_version_a, 37, 'COBRA continuation lasts:', '6 months', '12 months', '18–36 months', 'Lifetime', 'C'),
  (v_version_a, 38, 'Under contributory group plans, what percentage of eligible employees must enroll?', '25%', '50%', '75%', '100%', 'C'),
  (v_version_a, 39, 'HIPAA ensures:', 'Guaranteed issue in individual markets', 'Coinsurance limits', 'Privacy and portability', 'Lower premiums', 'C'),
  (v_version_a, 40, 'Evidence of insurability is typically required when:', 'Joining on time', 'During open enrollment', 'Enrolling late', 'Employer requests', 'C'),
  (v_version_a, 41, 'LTC insurance triggers when the insured cannot perform:', 'Any meal preparation', 'At least 2 ADLs', 'One ADL', 'Cognitive tests', 'B'),
  (v_version_a, 42, 'ADLs include all EXCEPT:', 'Dressing', 'Eating', 'Managing finances', 'Transferring', 'C'),
  (v_version_a, 43, 'Which LTC benefit adjusts with inflation?', 'Elimination period', 'Nonforfeiture', 'Inflation protection', 'Benefit maximum', 'C'),
  (v_version_a, 44, 'Which level of care requires medical professionals?', 'Custodial care', 'Home health aid', 'Skilled nursing', 'Adult daycare', 'C'),
  (v_version_a, 45, 'LTC elimination periods typically range:', '1–5 days', '30–180 days', '1–2 years', 'Lifetime', 'B'),
  (v_version_a, 46, 'What does Medigap NOT cover?', 'Part B coinsurance', 'Part A deductible', 'Part D drugs', 'Hospice coinsurance', 'C'),
  (v_version_a, 47, 'Medicare SELECT requires:', 'No networks', 'Use of specific network hospitals', 'Dental coverage', 'ACA coverage', 'B'),
  (v_version_a, 48, 'What is the Part A deductible charged per?', 'Year', 'Month', 'Benefit period', 'Visit', 'C'),
  (v_version_a, 49, 'Skilled nursing under Part A requires:', '1-day hospital stay', '3-day hospital stay', '5-day hospital stay', 'No hospital stay', 'B'),
  (v_version_a, 50, 'What is guaranteed issue for Medigap?', 'Anytime enrollment', 'Enrollment without underwriting at specific times', 'Enrollment during AEP', 'Enrollment only after MA', 'B')
  ON CONFLICT (version_id, question_number) DO NOTHING;

END $$;
