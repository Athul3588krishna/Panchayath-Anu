const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Scheme = require('../models/Scheme');
const Announcement = require('../models/Announcement');
const Application = require('../models/Application');
const Appointment = require('../models/Appointment');

dotenv.config();

const schemesData = [
  {
    title: 'Poultry Farming Assistance Scheme',
    description: 'Provides a 50% capital subsidy on setup costs for poultry farms up to 500 birds, including free training, veterinarian visits, and starter feed bags.',
    category: 'Animal Husbandry',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 65,
      maxIncome: 100000,
      allowedOccupations: [],
      allowedCategories: []
    },
    requiredDocuments: ['Aadhar Card', 'Income Certificate', 'Land Ownership or Lease Agreement', 'Bank Passbook Details'],
    formUrl: '',
    viewsCount: 142,
    downloadsCount: 38,
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) 
  },
  {
    title: 'BPL Goat Farming Subsidy',
    description: 'Distributes a livestock unit of 5 goats (4 female + 1 male) to below-poverty-line families. Covers 90% subsidy for SC/ST and 75% for OBC categories to encourage rural self-employment.',
    category: 'Animal Husbandry',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 60,
      maxIncome: 50000,
      allowedOccupations: [],
      allowedCategories: ['SC', 'ST', 'OBC']
    },
    requiredDocuments: ['Aadhar Card', 'BPL Ration Card', 'Caste Certificate', 'Panchayat Residence Certificate'],
    formUrl: '',
    viewsCount: 205,
    downloadsCount: 64,
    expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) 
  },
  {
    title: 'Organic Farming & Vermicompost Subsidies',
    description: 'Financial assistance of ₹8,000 for constructing a vermicompost pit and free distribution of organic soil conditioners to promote eco-friendly agriculture.',
    category: 'Agriculture',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 75,
      maxIncome: null,
      allowedOccupations: ['Farmer', 'Agriculture worker'],
      allowedCategories: []
    },
    requiredDocuments: ['Aadhar Card', 'Land Tax Receipt', 'Farmer ID Card', 'Bank Passbook Details'],
    formUrl: '',
    viewsCount: 97,
    downloadsCount: 19,
    expiresAt: null 
  },
  {
    title: 'Free Saplings and Plant Distribution Drive',
    description: 'Free distribution of high-yield fruit-bearing plants (Mango, Coconut, Jackfruit) and timber saplings to promote green cover and long-term local farm income.',
    category: 'Agriculture',
    eligibilityCriteria: {
      minAge: 12,
      maxAge: 100,
      maxIncome: null,
      allowedOccupations: [],
      allowedCategories: []
    },
    requiredDocuments: ['Aadhar Card', 'Land Possession Certificate (Optional)'],
    formUrl: '',
    viewsCount: 78,
    downloadsCount: 5,
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) 
  },
  {
    title: 'Panchayat Rural Housing Scheme (PMAY-G)',
    description: 'Provides a financial assistance grant of ₹1,20,000 in plains and ₹1,30,000 in hilly/difficult areas for the construction of a permanent (pucca) house for homeless citizens.',
    category: 'Housing',
    eligibilityCriteria: {
      minAge: 21,
      maxAge: 70,
      maxIncome: 120000,
      allowedOccupations: [],
      allowedCategories: []
    },
    requiredDocuments: ['Aadhar Card', 'Income Certificate', 'Ration Card (BPL)', 'Photo of existing dilapidated shelter', 'Job Card Number'],
    formUrl: '',
    viewsCount: 310,
    downloadsCount: 112,
    expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) 
  },
  {
    title: 'Panchayat Higher Education Merit Scholarship',
    description: 'Annual scholarship of ₹10,000 to assist high-performing students who scored above 80% marks in Class 10/12 board exams, belonging to low-income rural households.',
    category: 'Education',
    eligibilityCriteria: {
      minAge: 15,
      maxAge: 23,
      maxIncome: 80000,
      allowedOccupations: ['Student'],
      allowedCategories: []
    },
    requiredDocuments: ['Aadhar Card', 'Income Certificate', 'Class 10/12 Marksheet', 'College Admission Proof'],
    formUrl: '',
    viewsCount: 184,
    downloadsCount: 45,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) 
  }
];

const announcementsData = [
  {
    title: 'Poultry & Goat Farming Schemes: Applications Open!',
    content: 'Applications are now open for the Livestock and Poultry Farming Assistance schemes for the financial year 2026-27. Citizens can download the forms directly from this portal or collect them in person from the Panchayat office. Please submit the completed applications along with income and land certificate enclosures before July 30, 2026.',
    isImportant: true,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) 
  },
  {
    title: 'Gram Sabha Meeting on July 15',
    content: 'The quarterly Gram Sabha general meeting is scheduled for Wednesday, July 15, 2026, starting at 10:30 AM in the Main Community Hall. Discussions will center around allocation of local agricultural subsidies, selection of housing scheme beneficiaries, and infrastructure updates. All ward members and citizens are encouraged to attend and participate.',
    isImportant: true,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) 
  },
  {
    title: 'Distribution of Free Saplings under Green Cover Initiative',
    content: 'To mark Environment Month, the Panchayat is distributing high-yield hybrid coconut and mango saplings. The distribution will take place at the Panchayat Nursery on Saturday, July 11, from 9:00 AM onwards. Up to 5 saplings will be provided per household on showing an Aadhar Card.',
    isImportant: false,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
  }
];

const performSeed = async (dbName) => {
  console.log(`[${dbName}] Clearing existing data...`);
  await User.deleteMany({});
  await Scheme.deleteMany({});
  await Announcement.deleteMany({});
  await Application.deleteMany({});
  await Appointment.deleteMany({});

  console.log(`[${dbName}] Seeding Admin account...`);
  const adminSalt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', adminSalt);
  const admin = await User.create({
    name: 'Panchayat Secretary',
    email: 'admin@panchayat.gov',
    password: adminPassword,
    role: 'admin',
    age: 45,
    annualIncome: 450000,
    occupation: 'Government Service',
    category: 'General'
  });
  console.log(`[${dbName}] Admin account created: ${admin.email}`);

  console.log(`[${dbName}] Seeding Citizen accounts...`);
  const citizenPassword = await bcrypt.hash('password123', adminSalt);
  const citizen1 = await User.create({
    name: 'Rajesh Kumar',
    email: 'citizen@test.com',
    password: citizenPassword,
    role: 'citizen',
    age: 35,
    annualIncome: 45000,
    occupation: 'Farmer',
    category: 'OBC'
  });
  console.log(`[${dbName}] Citizen Rajesh created: ${citizen1.email}`);

  const citizen2 = await User.create({
    name: 'Sheela Devi',
    email: 'sheela@test.com',
    password: citizenPassword,
    role: 'citizen',
    age: 25,
    annualIncome: 12000,
    occupation: 'Unemployed',
    category: 'SC'
  });
  console.log(`[${dbName}] Citizen Sheela created: ${citizen2.email}`);

  console.log(`[${dbName}] Seeding Welfare Schemes...`);
  await Scheme.insertMany(schemesData);
  console.log(`[${dbName}] ${schemesData.length} welfare schemes seeded.`);

  console.log(`[${dbName}] Seeding Announcements...`);
  await Announcement.insertMany(announcementsData);
  console.log(`[${dbName}] ${announcementsData.length} announcements seeded.`);
};

const seedData = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_panchayat';
  
  try {
    // 1. Force disconnect mongoose first to write to local JSON files
    console.log('--- STEP 1: Seeding JSON DB Fallback Files ---');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await performSeed('JSON DB');
    console.log('JSON DB Seeding completed successfully.\n');

    // 2. Connect mongoose to seed MongoDB database
    console.log('--- STEP 2: Seeding MongoDB Database ---');
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
      console.log('Connected to MongoDB database.');
      await performSeed('MongoDB');
      console.log('MongoDB Seeding completed successfully.\n');
    } catch (err) {
      console.warn('\n======================================================');
      console.warn('MongoDB offline or unreachable. Skipping MongoDB seeding.');
      console.warn('Backend will use the seeded JSON DB fallback.');
      console.warn('======================================================\n');
    }

    console.log('All seeding actions completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
