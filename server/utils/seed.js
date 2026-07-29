require('dotenv').config();
const connectDB = require('../config/db');
const Category = require('../models/Category');

const CATEGORY_NAMES = [
  'Web Development',
  'Frontend',
  'Backend',
  'Full Stack',
  'AI / Machine Learning',
  'Data Science',
  'DevOps',
  'Mobile Development',
  'UI/UX Design',
  'Cybersecurity',
  'Blockchain',
  'Cloud Computing',
];

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function seed() {
  await connectDB();

  for (const name of CATEGORY_NAMES) {
    const slug = slugify(name);
    await Category.findOneAndUpdate(
      { slug },
      { name, slug },
      { upsert: true, new: true }
    );
  }

  console.log(`Seeded ${CATEGORY_NAMES.length} categories.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});