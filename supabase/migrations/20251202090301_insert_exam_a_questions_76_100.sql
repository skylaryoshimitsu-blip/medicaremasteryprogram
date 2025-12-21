/*
  # Insert Exam A Questions 76-100
*/

DO $$
DECLARE
  v_version_a uuid;
BEGIN
  SELECT id INTO v_version_a FROM exam_versions WHERE version_letter = 'A';

  INSERT INTO exam_questions (version_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
  (v_version_a, 76, 'MACRA eliminated the sale of which Medigap plan for new beneficiaries?', 'Plan A', 'Plan D', 'Plan F', 'Plan N', 'C'),
  (v_version_a, 77, 'The penalty for late Medicare Part A enrollment applies when:', 'The individual lacks 40 quarters', 'The individual delays Part A despite being eligible', 'The beneficiary moves states', 'Part A premiums rise', 'B'),
  (v_version_a, 78, 'TRICARE For Life coordinates with:', 'Medicaid', 'VA', 'Medicare', 'Employer insurance', 'C'),
  (v_version_a, 79, 'When a beneficiary has ESRD, when can they join Medicare Advantage?', 'Never', 'Only after transplant', 'Typically allowed after 2021 rule change', 'Only at age 65', 'C'),
  (v_version_a, 80, 'Which Medicare enrollment period allows switching from MA back to Original Medicare?', 'AEP', 'IEP', 'SEP only', 'OEP', 'D'),
  (v_version_a, 81, 'What is the first level of Medicare appeals?', 'Court review', 'ALJ hearing', 'Redetermination', 'Reconsideration', 'C'),
  (v_version_a, 82, 'How long does a beneficiary typically have to file an appeal?', '10 days', '30 days', '60 days', '6 months', 'C'),
  (v_version_a, 83, 'Agents must store Scope of Appointment forms for:', '6 months', '1 year', '5 years', '10 years', 'D'),
  (v_version_a, 84, 'CMS prohibits plans from marketing:', 'Educational events', 'Health-related tips', 'Absolute, guaranteed savings', 'Online ads', 'C'),
  (v_version_a, 85, 'Which statement about unsolicited contact is correct?', 'Cold-calling is allowed', 'Door-to-door marketing is allowed', 'Agents may call referrals without permission', 'Agents may not cold call Medicare beneficiaries', 'D'),
  (v_version_a, 86, 'At educational events, agents:', 'May collect enrollment forms', 'Cannot discuss plan-specific benefits', 'Must close sales', 'Can offer free meals', 'B'),
  (v_version_a, 87, 'At sales events, agents:', 'Cannot accept enrollment', 'Can accept enrollment forms', 'Cannot mention networks', 'Cannot discuss costs', 'B'),
  (v_version_a, 88, 'Agents may:', 'Offer gifts worth over $75', 'Provide nominal gifts under $15', 'Offer cash', 'Enter beneficiaries into raffles', 'B'),
  (v_version_a, 89, 'What is NOT covered by Medicare?', 'Hospice', 'Routine dental', 'Medically necessary surgery', 'Skilled nursing', 'B'),
  (v_version_a, 90, 'What does the ABN (Advance Beneficiary Notice) notify?', 'Plan change approval', 'Coverage denial for specific service', 'Premium increase', 'Eligibility change', 'B'),
  (v_version_a, 91, 'Under Part A, how many lifetime reserve days are available?', '30', '60', '90', '150', 'B'),
  (v_version_a, 92, 'Part B-covered preventive service includes:', 'Routine dental', 'Cosmetic surgery', 'Colonoscopy', 'Eyeglasses', 'C'),
  (v_version_a, 93, 'Under Medicare Advantage, using out-of-network providers in an HMO generally results in:', 'No coverage', 'Higher deductible', 'Lower premium', 'Automatic approval', 'A'),
  (v_version_a, 94, 'A PPO plan offers:', 'No out-of-network coverage', 'Lower cost in-network and higher cost out-of-network', 'Free prescriptions', 'Guaranteed dental', 'B'),
  (v_version_a, 95, 'Which situation qualifies for a SEP?', 'Wanting a cheaper plan', 'Losing employer coverage', 'Disliking copays', 'Moving zip codes within the same plan region', 'B'),
  (v_version_a, 96, 'Medicaid + Medicare dual-eligibles receive:', 'No special assistance', 'Limited prescription drug help', 'Full cost-sharing assistance depending on category', 'Guaranteed Medigap', 'C'),
  (v_version_a, 97, 'Which plan type includes built-in drug coverage most often?', 'Medigap', 'PPO', 'HMO', 'Part C', 'D'),
  (v_version_a, 98, 'Which Medicare coverage requires premium payment for most people?', 'Part A', 'Part B', 'Part C', 'Nothing requires premiums', 'B'),
  (v_version_a, 99, 'What type of care does Medicare NOT cover long-term?', 'Skilled nursing', 'Custodial care', 'Hospice', 'Home health', 'B'),
  (v_version_a, 100, 'If a beneficiary enrolls in a Medicare Advantage plan, what happens to their Part A & B?', 'They lose them', 'They remain enrolled in both', 'They switch to Medicaid', 'They receive only Part D', 'B')
  ON CONFLICT (version_id, question_number) DO NOTHING;

END $$;
