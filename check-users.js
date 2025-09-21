const db = require('./src/config/db');

async function checkUsers() {
  try {
    const result = await db.query('SELECT id, name, email, roles FROM users ORDER BY created_at DESC');
    console.log('=== USERS IN DATABASE ===');
    if (result.rows.length === 0) {
      console.log('No users found.');
    } else {
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   Roles: ${JSON.stringify(user.roles)}`);
        console.log(`   ID: ${user.id}`);
        console.log('---');
      });
    }
    
    // Check specifically for admin users
    const adminResult = await db.query("SELECT * FROM users WHERE roles @> '[\"admin\"]'");
    console.log('\n=== ADMIN USERS ===');
    if (adminResult.rows.length === 0) {
      console.log('No admin users found.');
    } else {
      adminResult.rows.forEach((admin) => {
        console.log(`✅ ${admin.name} (${admin.email}) - Admin access available`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkUsers();