const config = require('../config');
const mongoose = require('mongoose');

const connect = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB for seeding...');
};

const User = require('../models/User');
const ServiceCategory = require('../models/ServiceCategory');
const ProviderProfile = require('../models/ProviderProfile');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const ServiceRequest = require('../models/ServiceRequest');
const Quote = require('../models/Quote');
const Booking = require('../models/Booking');
const JobUpdate = require('../models/JobUpdate');
const Invoice = require('../models/Invoice');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const Notification = require('../models/Notification');

const { ROLES } = require('../utils/constants');

const PASSWORD = 'Pass@1234';
const daysFromNow = (days, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
};
const hoursAfter = (d, h) => new Date(d.getTime() + h * 60 * 60 * 1000);

const CATEGORY_DEFS = [
  { name: 'Plumbing', icon: '🚰', skills: ['Leak Repair', 'Pipe Repair', 'Drain Unclogging', 'Fixture Installation'], basePrice: 350 },
  { name: 'Electrical', icon: '⚡', skills: ['Wiring Repair', 'Switch & Socket Fix', 'Circuit Troubleshooting', 'Fixture Wiring'], basePrice: 400 },
  { name: 'Home Cleaning', icon: '🧹', skills: ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning', 'Carpet Care'], basePrice: 600 },
  { name: 'Appliance Repair', icon: '🔌', skills: ['Refrigerator Repair', 'Washing Machine Repair', 'Microwave Repair', 'Diagnostics'], basePrice: 500 },
  { name: 'Carpentry', icon: '🪚', skills: ['Furniture Repair', 'Cabinet Fixing', 'Door & Hinge Repair', 'Woodwork'], basePrice: 350 },
  { name: 'Painting', icon: '🎨', skills: ['Interior Painting', 'Exterior Painting', 'Wall Preparation', 'Waterproofing'], basePrice: 800 },
  { name: 'AC Repair', icon: '❄️', skills: ['AC Service', 'Gas Refill', 'Compressor Repair', 'Filter Cleaning'], basePrice: 450 },
  { name: 'Home Maintenance', icon: '🛠️', skills: ['General Repairs', 'Tiling', 'Sealant Work', 'Fixture Fixing'], basePrice: 300 },
];

const DESCRIPTION = {
  Plumbing: 'My kitchen tap is leaking continuously and water is coming under the sink.',
  Electrical: 'The main switch trips whenever we plug in the washing machine. Need a licensed electrician.',
  'Home Cleaning': 'Need a deep cleaning of a 3BHK apartment including kitchen degreasing and bathroom descaling.',
  'Appliance Repair': 'Refrigerator is not cooling properly and making a loud noise. Ice building up on the back wall.',
  Carpentry: 'The bedroom wardrobe door is jammed and the drawer track is broken. Needs carpentry repair.',
  Painting: 'Living room walls have peeling paint and water stains. Need repainting including plaster repair.',
  'AC Repair': 'AC is not cooling since last month and needs a gas refill plus filter cleaning service.',
  'Home Maintenance': 'Balcony ceiling has a water leakage stain and grout in the bathroom is broken in places.',
};

const PROVIDER_NAMES = [
  { user: 'Ramesh Kumar', business: 'Ramesh Plumbing Works', skills: ['Leak Repair', 'Pipe Repair', 'Drain Unclogging', 'Fixture Installation', 'AC Service'], cats: ['Plumbing', 'AC Repair'] },
  { user: 'Suresh Nair', business: 'Suresh Electricals', skills: ['Wiring Repair', 'Switch & Socket Fix', 'Circuit Troubleshooting', 'Fixture Wiring'], cats: ['Electrical'] },
  { user: 'Anita Sharma', business: 'Shine Bright Cleaning Co.', skills: ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning', 'Carpet Care'], cats: ['Home Cleaning'] },
  { user: 'Vijay Patel', business: 'Vijay Appliances Care', skills: ['Refrigerator Repair', 'Washing Machine Repair', 'Microwave Repair', 'Diagnostics'], cats: ['Appliance Repair'] },
  { user: 'Mohan Das', business: 'Mohan Carpentry Studio', skills: ['Furniture Repair', 'Cabinet Fixing', 'Door & Hinge Repair', 'Woodwork'], cats: ['Carpentry'] },
  { user: 'Priya Rao', business: 'ColorVerse Painting', skills: ['Interior Painting', 'Exterior Painting', 'Wall Preparation', 'Waterproofing'], cats: ['Painting'] },
  { user: 'Arjun Mehta', business: 'CoolAir AC Experts', skills: ['AC Service', 'Gas Refill', 'Compressor Repair', 'Filter Cleaning', 'Leak Repair'], cats: ['AC Repair', 'Plumbing'] },
  { user: 'Kiran Joshi', business: 'HandyMan 360', skills: ['General Repairs', 'Tiling', 'Sealant Work', 'Fixture Fixing', 'Furniture Repair'], cats: ['Home Maintenance', 'Carpentry'] },
  { user: 'Deepak Verma', business: 'Deepak Plumbing & Sanitary', skills: ['Leak Repair', 'Pipe Repair', 'Drain Unclogging', 'Fixture Installation', 'General Repairs'], cats: ['Plumbing', 'Home Maintenance'] },
  { user: 'Sunita Desai', business: 'Sparkle & Shine Services', skills: ['Deep Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning', 'Carpet Care', 'Washing Machine Repair'], cats: ['Home Cleaning', 'Appliance Repair'] },
];

const CUSTOMERS = [
  { name: 'Amit Singh', phone: '9810000001', address: { label: 'Home', line1: '12 Rose Apartments, Andheri West', city: 'Mumbai', state: 'Maharashtra', postalCode: '400053' } },
  { name: 'Neha Gupta', phone: '9810000002', address: { label: 'Home', line1: '45 Lakeview Colony', city: 'Pune', state: 'Maharashtra', postalCode: '411001' } },
  { name: 'Rohan Iyer', phone: '9810000003', address: { label: 'Home', line1: '88 Green Park Extension', city: 'New Delhi', state: 'Delhi', postalCode: '110016' } },
  { name: 'Sneha Kapoor', phone: '9810000004', address: { label: 'Home', line1: '21 Palm Meadows, Banjara Hills', city: 'Hyderabad', state: 'Telangana', postalCode: '500034' } },
  { name: 'Vikram Malhotra', phone: '9810000005', address: { label: 'Home', line1: '301 Sea Breeze Towers', city: 'Bengaluru', state: 'Karnataka', postalCode: '560001' } },
];

const REVIEW_COMMENTS = [
  'Very professional and quick work. Highly recommend!',
  'Good quality service but could improve timing.',
  'Extremely knowledgeable and tidy. Great experience.',
  'Fair pricing and clear communication.',
  'Fixed the issue in one visit. Would book again.',
];

const clearDB = async () => {
  const models = [
    User, ServiceCategory, ProviderProfile, AvailabilitySlot, ServiceRequest,
    Quote, Booking, JobUpdate, Invoice, Review, Dispute, Notification,
  ];
  await Promise.all(models.map((m) => m.deleteMany({})));
  console.log('Cleared existing data');
};

let categoriesById = {};

const seed = async () => {
  await clearDB();

  // ---- Staff ----
  const admin = await User.create({ name: 'Platform Admin', email: 'admin@careconnect.com', password: PASSWORD, phone: '9899000000', role: ROLES.PLATFORM_ADMIN });
  const ops = await User.create({ name: 'Operations Manager', email: 'ops@careconnect.com', password: PASSWORD, phone: '9899000001', role: ROLES.OPERATIONS_MANAGER });
  const support = await User.create({ name: 'Support Agent', email: 'support@careconnect.com', password: PASSWORD, phone: '9899000002', role: ROLES.SUPPORT_AGENT });
  console.log('Staff created', { admin: admin.email, ops: ops.email, support: support.email });

  // ---- Categories ----
  for (const c of CATEGORY_DEFS) {
    const category = await ServiceCategory.create({
      name: c.name,
      description: `Professional ${c.name.toLowerCase()} services for your home.`,
      icon: c.icon,
      requiredSkills: c.skills,
      basePrice: c.basePrice,
      isActive: true,
    });
    categoriesById[c.name] = category;
  }
  console.log('Categories created:', CATEGORY_DEFS.length);

  // ---- Customers ----
  const customers = [];
  for (const c of CUSTOMERS) {
    const user = await User.create({
      name: c.name,
      email: `${c.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      password: PASSWORD,
      phone: c.phone,
      role: ROLES.CUSTOMER,
      addresses: [c.address],
    });
    customers.push({ user, address: c.address });
  }
  console.log('Customers created:', customers.length);

  // ---- Providers ----
  const providers = [];
  for (let i = 0; i < PROVIDER_NAMES.length; i++) {
    const def = PROVIDER_NAMES[i];
    const user = await User.create({
      name: def.user,
      email: `provider${i + 1}@careconnect.com`,
      password: PASSWORD,
      phone: `9820${String(10000 + i * 37)}`,
      role: ROLES.SERVICE_PROVIDER,
    });
    const cats = def.cats.map((c) => categoriesById[c]._id);
    const experience = 3 + i;
    const profile = await ProviderProfile.create({
      user: user._id,
      businessName: def.business,
      description: `${def.user} provides reliable ${def.cats.join(' & ').toLowerCase()} services with transparent pricing and quality workmanship.`,
      experience,
      skills: def.skills,
      serviceCategories: cats,
      serviceAreas: [
        { city: 'Mumbai', pincode: '400001' },
        { city: 'Pune', pincode: '411001' },
        { city: 'New Delhi', pincode: '110001' },
        { city: 'Hyderabad', pincode: '500001' },
        { city: 'Bengaluru', pincode: '560001' },
      ],
      pricing: { baseRate: 300 + i * 40, unit: 'PER_JOB', minimumCharge: 250, travelFee: 50, currency: 'INR' },
      verificationStatus: i < 8 ? 'VERIFIED' : (i === 8 ? 'PENDING' : 'VERIFIED'),
      completedJobs: (i + 1) * 24,
      averageRating: 3.8 + ((i * 17) % 12) / 10,
      totalReviews: 5 + i * 3,
      isAvailable: true,
    });
    providers.push({ user, profile });
  }
  // Ensure ratings stay within bounds
  for (const p of providers) {
    p.profile.averageRating = Math.min(5, Math.max(3.5, p.profile.averageRating));
    await p.profile.save();
  }
  console.log('Providers created:', providers.length);

  // ---- Availability slots for verified providers  ----
  for (let day = 1; day <= 5; day++) {
    for (const p of providers.slice(0, 8)) {
      for (const hour of [9, 12, 15, 18]) {
        await AvailabilitySlot.create({
          provider: p.profile._id,
          startTime: daysFromNow(day, hour),
          endTime: hoursAfter(daysFromNow(day, hour), 2),
          isAvailable: true,
        });
      }
    }
  }
  console.log('Availability slots created');

  // ---- Service requests + quotes + bookings + reviews ----
  const catNames = CATEGORY_DEFS.map((c) => c.name);

  for (let i = 0; i < 8; i++) {
    const catName = catNames[i % catNames.length];
    const category = categoriesById[catName];
    const cust = customers[i % customers.length];

    const request = await ServiceRequest.create({
      customer: cust.user._id,
      title: `${catName} service needed ${i + 1}`,
      description: DESCRIPTION[catName],
      address: { ...cust.address, label: 'Service address' },
      preferredDate: daysFromNow(2 + (i % 3), 10),
      preferredTime: '10:00 AM - 02:00 PM',
      category: category._id,
      categoryName: catName,
      requiredSkills: category.requiredSkills.slice(0, 3),
      AIClassification: {
        category: catName,
        requiredSkills: category.requiredSkills.slice(0, 3),
        urgency: ['Low', 'Medium', 'High'][i % 3],
        keywords: [DESCRIPTION[catName].split(' ')[1], 'leak', 'repair'],
        summary: `${catName} service needed.`,
        confidence: 0.85 + (i % 10) / 50,
        gateway: 'seed',
      },
      status: 'QUOTES_RECEIVED',
      aiMatchedProviders: providers.filter((_, idx) => idx % 3 === i % 3 && idx < 8).map((p) => p.profile._id),
    });

    // Add quotes from 2-3 matching providers
    for (let q = 0; q < 3; q++) {
      const provider = providers[(i + q) % 8];
      const quote = await Quote.create({
        serviceRequest: request._id,
        provider: provider.profile._id,
        estimatedPrice: (400 + i * 30 + q * 90),
        description: `I will complete the ${catName.toLowerCase()} work within the approved scope.`,
        estimatedDuration: '2-3 hours',
        status: q === 0 && i % 2 === 0 ? 'ACCEPTED' : 'PENDING',
      });

      const matched = request.aiMatchedProviders;
      if (matched.length === 0) {
        request.aiMatchedProviders = [provider.profile._id];
        await request.save();
      }

      if (q === 0) {
        // Create a booking for some requests to support jobs/invoices/reviews
        const isBooked = i % 2 === 0;
        if (isBooked) {
          const startTime = daysFromNow(1, 10);
          const endTime = hoursAfter(startTime, 2);
          const status =
            i === 0 ? 'CUSTOMER_CONFIRMED' :
            i === 2 ? 'COMPLETED' :
            i === 4 ? 'IN_PROGRESS' :
            i === 6 ? 'CANCELLED' : 'CONFIRMED';

          const booking = await Booking.create({
            customer: cust.user._id,
            provider: provider.profile._id,
            serviceRequest: request._id,
            quote: quote._id,
            scheduledStartTime: startTime,
            scheduledEndTime: endTime,
            address: request.address,
            status,
            cancellationReason: status === 'CANCELLED' ? 'Customer changed their mind' : '',
            totalPrice: quote.estimatedPrice,
          });

          await JobUpdate.create({
            booking: booking._id,
            provider: provider.profile._id,
            status: status,
            note: status === 'CUSTOMER_CONFIRMED' ? 'Job completed and confirmed by the customer.' : 'Booking created. Provider assigned.',
            beforeImages: [],
            afterImages: [],
          });

          if (status === 'CUSTOMER_CONFIRMED' || status === 'COMPLETED') {
            const invoice = await Invoice.create({
              booking: booking._id,
              invoiceNumber: `CC-SEED-${1000 + i}`,
              provider: provider.profile._id,
              customer: cust.user._id,
              services: [{ description: `${catName} service`, quantity: 1, unitPrice: quote.estimatedPrice }],
              subtotal: quote.estimatedPrice,
              taxes: Math.round(quote.estimatedPrice * 0.1),
              totalAmount: Math.round(quote.estimatedPrice * 1.1),
              paymentStatus: 'PAID',
            });

            if (status === 'CUSTOMER_CONFIRMED') {
              await Review.create({
                customer: cust.user._id,
                provider: provider.profile._id,
                booking: booking._id,
                rating: 4 + (i % 2),
                comment: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length],
                createdAt: daysFromNow(-2),
              });

              const agg = await Review.aggregate([
                { $match: { provider: provider.profile._id } },
                { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
              ]);
              if (agg[0]) {
                await ProviderProfile.updateOne(
                  { _id: provider.profile._id },
                  { averageRating: Math.round(agg[0].avg * 100) / 100, totalReviews: agg[0].count }
                );
              }
            }
          }
        }
      }
    }

    await request.save();
  }

  // ---- Extra open requests for demo ----
  const openRequests = [
    { title: 'Kitchen sink drainage blocked', cat: 'Plumbing', desc: 'Kitchen sink drainage is blocked and water is not going down at all.' },
    { title: 'Bedroom fan not rotating properly', cat: 'Electrical', desc: 'Ceiling fan makes noise and not rotating properly. Needs urgent repair.' },
    { title: 'Washing machine drum making noise', cat: 'Appliance Repair', desc: 'Washing machine drum is making a loud metallic noise during the spin cycle.' },
  ];
  for (let i = 0; i < openRequests.length; i++) {
    const { title, cat, desc } = openRequests[i];
    const category = categoriesById[cat];
    const cust = customers[(i + 2) % customers.length];
    const request = await ServiceRequest.create({
      customer: cust.user._id,
      title,
      description: desc,
      address: { ...cust.address, label: 'Service address' },
      preferredDate: daysFromNow(3, 11),
      preferredTime: '11:00 AM',
      category: category._id,
      categoryName: cat,
      requiredSkills: category.requiredSkills.slice(0, 3),
      AIClassification: {
        category: cat,
        requiredSkills: category.requiredSkills.slice(0, 3),
        urgency: i === 1 ? 'High' : 'Medium',
        keywords: desc.toLowerCase().split(' ').filter((w) => w.length > 4).slice(0, 5),
        summary: `${cat} service needed.`,
        confidence: 0.9,
        gateway: 'seed',
      },
      status: 'OPEN',
      aiMatchedProviders: [providers[0].profile._id, providers[7].profile._id],
    });
    await require('../models/Notification').create({
      user: providers[0].user._id,
      title: 'New matching service request',
      message: `A new service request "${title}" matches your skills. Submit a quote now.`,
      type: 'REQUEST',
      relatedResource: { model: 'ServiceRequest', id: request._id },
    });
  }

  // ---- Seed notifications ----
  await Notification.create({
    user: admin._id,
    title: 'Welcome to CareConnect',
    message: 'Your platform admin account is ready. Manage users, providers and disputes from the dashboard.',
    type: 'SYSTEM',
  });
  await Notification.create({
    user: ops._id,
    title: 'Monitor bookings',
    message: 'Check the bookings dashboard to review active jobs and assign providers.',
    type: 'SYSTEM',
  });
  await Notification.create({
    user: support._id,
    title: 'Pending disputes',
    message: 'Some disputes are waiting for support agent review.',
    type: 'DISPUTE',
  });

  // ---- A demo dispute for support ----
  const someBooking = await Booking.findOne({ status: 'COMPLETED' });
  if (someBooking) {
    await Dispute.create({
      booking: someBooking._id,
      raisedBy: someBooking.customer,
      reason: 'Workmanship quality',
      description: 'The paint job was not done properly, some patches are visible.',
      status: 'UNDER_REVIEW',
      assignedSupportAgent: support._id,
      evidence: [],
    });
  }

  console.log('Seed data complete!');
  console.log('Login accounts:');
  console.log('  admin@careconnect.com  / Pass@1234  (PLATFORM_ADMIN)');
  console.log('  ops@careconnect.com    / Pass@1234  (OPERATIONS_MANAGER)');
  console.log('  support@careconnect.com/ Pass@1234  (SUPPORT_AGENT)');
  console.log('  provider1..10@careconnect.com / Pass@1234  (SERVICE_PROVIDER)');
  console.log('  customers: amit.singh@example.com etc / Pass@1234  (CUSTOMER)');
};

connect()
  .then(seed)
  .then(() => mongoose.disconnect())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });