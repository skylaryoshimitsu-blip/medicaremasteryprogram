/*
  # Insert Exam A Questions - Part 1 (Questions 1-25)
*/

DO $$
DECLARE
  v_version_a uuid;
BEGIN
  SELECT id INTO v_version_a FROM exam_versions WHERE version_letter = 'A';

  INSERT INTO exam_questions (version_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
  (v_version_a, 1, 'Medicare Part A primarily covers which type of services?', 'Outpatient doctor visits', 'Hospitalization', 'Prescription drugs', 'Vision exams', 'B'),
  (v_version_a, 2, 'What is the standard premium most people pay for Medicare Part A?', '$0', '$45', '$174', '$250', 'A'),
  (v_version_a, 3, 'The Initial Enrollment Period (IEP) lasts for:', '3 months', '6 months', '7 months', '12 months', 'C'),
  (v_version_a, 4, 'Medicare Part B covers which of the following?', 'Hospice', 'Skilled nursing', 'Durable medical equipment', 'Prescription drugs', 'C'),
  (v_version_a, 5, 'A Medicare beneficiary automatically gets Part A at age 65 if:', 'They request it', 'They are receiving Social Security', 'They mail an application', 'Their employer enrolls them', 'B'),
  (v_version_a, 6, 'The penalty for not enrolling in Part B when eligible is:', '5%', '10% per year', '20% flat', 'No penalty', 'B'),
  (v_version_a, 7, 'Medigap plans are standardized under which federal law?', 'COBRA', 'HIPAA', 'OBRA', 'ERISA', 'C'),
  (v_version_a, 8, 'Medicare Advantage is also known as:', 'Part D', 'Part C', 'Part F', 'Medigap', 'B'),
  (v_version_a, 9, 'Which part of Medicare covers inpatient hospital care?', 'Part A', 'Part B', 'Part C', 'Part D', 'A'),
  (v_version_a, 10, 'Who administers Medicare?', 'Private insurers', 'State governments', 'CMS', 'Medicaid offices', 'C'),
  (v_version_a, 11, 'A Medicare Advantage plan must cover:', 'More benefits than Original Medicare', 'At least the same as Original Medicare', 'Only hospital care', 'Only outpatient care', 'B'),
  (v_version_a, 12, 'Most Medicare Advantage plans include:', 'Vision and dental always', 'Free Part D', 'Part D drug coverage', 'Guaranteed no premiums', 'C'),
  (v_version_a, 13, 'Part D penalties apply if an individual goes without creditable coverage for:', '30 days', '63 days', '6 months', '12 months', 'B'),
  (v_version_a, 14, 'What is the coverage gap commonly called?', 'Red Zone', 'Donut Hole', 'Cap Limit', 'Medicare Gap', 'B'),
  (v_version_a, 15, 'Which of the following is required in all Part D plans?', 'Specialty tier caps', 'Vaccines at no cost', 'Dental care', 'Vision care', 'B'),
  (v_version_a, 16, 'Which Medicare part has an annual deductible?', 'Part A only', 'Part B only', 'Part D only', 'Part B and D', 'D'),
  (v_version_a, 17, 'The Part B premium penalty is based on:', 'Length of coverage', 'Life expectancy', 'Income (IRMAA)', 'Enrollment year', 'C'),
  (v_version_a, 18, 'Part A has a benefit period of:', '30 days', '60 days', 'Until discharged + 60 days', 'Lifetime', 'C'),
  (v_version_a, 19, 'To be eligible for premium-free Part A, a person needs:', '5 quarters', '10 quarters', '20 quarters', '40 quarters', 'D'),
  (v_version_a, 20, 'Who is eligible for Medicare under age 65?', 'Anyone', 'Medicaid recipients', 'People with disabilities receiving SSDI for 24 months', 'Veterans only', 'C'),
  (v_version_a, 21, 'When a beneficiary has employer coverage and Medicare, who pays first if employer has 20+ employees?', 'Medicare', 'Medicaid', 'Employer plan', 'Veteran benefits', 'C'),
  (v_version_a, 22, 'Who processes Medicare claims?', 'Private contractors', 'State insurance departments', 'Hospitals', 'Employers', 'A'),
  (v_version_a, 23, 'Under Medicare rules, marketing events:', 'May pressure beneficiaries', 'Must be educational', 'Cannot discuss plans', 'Must be door-to-door', 'B'),
  (v_version_a, 24, 'A Scope of Appointment must be kept for:', '24 hours', '30 days', '6 months', '10 years', 'D'),
  (v_version_a, 25, 'Which cannot be offered as an incentive to enroll?', 'Water', 'Free meals', 'Coffee', 'Educational material', 'B')
  ON CONFLICT (version_id, question_number) DO NOTHING;

END $$;
