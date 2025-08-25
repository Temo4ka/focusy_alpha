require('dotenv').config();
const { sequelize, User } = require('./modules');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    const users = [
      { user_id: 1001, name: 'Анна Петрова', user_class: '5', consent_given: true, experience_points: 1500, coins: 75, subscribe: false },
      { user_id: 1002, name: 'Максим Волков', user_class: '6', consent_given: true, experience_points: 2300, coins: 115, subscribe: true },
      { user_id: 1003, name: 'София Смирнова', user_class: '4', consent_given: true, experience_points: 800, coins: 40, subscribe: false },
      { user_id: 1004, name: 'Даниил Орлов', user_class: '7', consent_given: true, experience_points: 950, coins: 52, subscribe: false },
      { user_id: 1005, name: 'Полина Ветрова', user_class: '8', consent_given: true, experience_points: 1200, coins: 60, subscribe: true }
    ];

    for (const u of users) {
      await User.upsert(u);
    }

    console.log('Seeded 5 users');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();


