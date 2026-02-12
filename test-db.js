import pg from 'pg';
const { Client } = pg;

async function testDatabaseConnection() {
  const client = new Client({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'communication'
  });

  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('✓ Successfully connected to PostgreSQL');
    
    // Get version
    const result = await client.query('SELECT version()');
    console.log('✓ PostgreSQL version:', result.rows[0].version);
    
    // Check if communication database exists
    const dbResult = await client.query(
      "SELECT datname FROM pg_database WHERE datname='communication'"
    );
    
    if (dbResult.rows.length > 0) {
      console.log('✓ Communication database exists');
    } else {
      console.log('✗ Communication database NOT found');
    }
    
    // List tables in communication database
    const tablesResult = await client.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );
    
    if (tablesResult.rows.length > 0) {
      console.log('✓ Database tables found:');
      tablesResult.rows.forEach(row => {
        console.log('  - ' + row.table_name);
      });
    } else {
      console.log('⚠ No tables found in database');
    }
    
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testDatabaseConnection();
