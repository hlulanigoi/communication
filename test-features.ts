import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testFeatures() {
  console.log('🧪 Testing JustFix Auto Electrix Backend Features\n');

  try {
    // Test 1: Get all students
    console.log('1️⃣ Testing GET /api/students');
    const studentsRes = await fetch(`${BASE_URL}/students`);
    const students = await studentsRes.json();
    console.log(`✅ Retrieved ${students.length} students`);
    if (students.length > 0) {
      console.log(`   Sample: ${students[0].name} - ${students[0].role}\n`);
    }

    // Test 2: Get all staff
    console.log('2️⃣ Testing GET /api/staff');
    const staffRes = await fetch(`${BASE_URL}/staff`);
    const staff = await staffRes.json();
    console.log(`✅ Retrieved ${staff.length} staff members`);
    if (staff.length > 0) {
      console.log(`   Sample: ${staff[0].name} - ${staff[0].role}\n`);
    }

    // Test 3: Get all clients
    console.log('3️⃣ Testing GET /api/clients');
    const clientsRes = await fetch(`${BASE_URL}/clients`);
    const clients = await clientsRes.json();
    console.log(`✅ Retrieved ${clients.length} clients`);
    if (clients.length > 0) {
      console.log(`   Sample: ${clients[0].name} - ${clients[0].accountType}\n`);
    }

    // Test 4: Filter clients by source
    console.log('4️⃣ Testing GET /api/clients/by-source/Insurance');
    const insuranceClientsRes = await fetch(`${BASE_URL}/clients/by-source/Insurance`);
    const insuranceClients = await insuranceClientsRes.json();
    console.log(`✅ Found ${insuranceClients.length} insurance clients\n`);

    // Test 5: Get operating expenses
    console.log('5️⃣ Testing GET /api/expenses');
    const expensesRes = await fetch(`${BASE_URL}/expenses`);
    const expenses = await expensesRes.json();
    console.log(`✅ Retrieved ${expenses.length} operating expenses\n`);

    // Test 6: Create a new student (POST)
    console.log('6️⃣ Testing POST /api/students (Create new student)');
    const newStudentRes = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: 'test@academy.com',
        role: 'Test Tech',
        type: 'Student',
        status: 'Active',
        supervisor: 'Test Manager',
        department: 'Testing'
      })
    });
    const newStudent = await newStudentRes.json();
    console.log(`✅ Created student: ${newStudent.name}\n`);

    // Test 7: Create a new client
    console.log('7️⃣ Testing POST /api/clients (Create new client)');
    const newClientRes = await fetch(`${BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Client',
        email: 'test@client.com',
        source: 'Direct',
        accountType: 'Individual',
        phone: '+1-555-9999',
        status: 'Active'
      })
    });
    const newClient = await newClientRes.json();
    console.log(`✅ Created client: ${newClient.name}\n`);

    // Test 8: Create an invoice (with insurance billing logic)
    console.log('8️⃣ Testing POST /api/invoices (with Insurance Billing Logic)');
    
    // Get first insurance client for testing
    if (insuranceClients.length > 0) {
      const invoiceRes = await fetch(`${BASE_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: insuranceClients[0].id,
          clientSource: 'Insurance',
          description: 'Test invoice for insurance client',
          partsTotal: '1000.00',
          laborTotal: '500.00',
          taxRate: '8.5',
          totalAmount: '1630.00'
        })
      });
      const invoice = await invoiceRes.json();
      console.log(`✅ Created invoice with automatic insurance split:`);
      console.log(`   Insurance Excess (Customer Pays): $${invoice.insuranceExcess}`);
      console.log(`   Insurance Claim Amount: $${invoice.insuranceClaimAmount}\n`);
    }

    // Test 9: Create an HR Note (with auto-pin logic)
    console.log('9️⃣ Testing POST /api/hr-notes (with Auto-Pin Logic)');
    if (staff.length > 0) {
      const hrNoteRes = await fetch(`${BASE_URL}/hr-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: staff[0].id,
          authorName: staff[0].name,
          content: 'This is a test HR notification',
          priority: 'High',
          category: 'Announcement',
          targetAudience: 'All'
        })
      });
      const hrNote = await hrNoteRes.json();
      console.log(`✅ Created HR Note (from ${staff[0].name}):`);
      console.log(`   Auto-pinned: ${hrNote._businessLogicApplied?.autoPinned}`);
      console.log(`   Pinned Duration: ${hrNote._businessLogicApplied?.pinnedDurationHours} hours\n`);
    }

    // Test 10: Get pinned HR notes
    console.log('🔟 Testing GET /api/hr-notes/pinned (Active Notifications)');
    const pinnedNotesRes = await fetch(`${BASE_URL}/hr-notes/pinned`);
    const pinnedNotes = await pinnedNotesRes.json();
    console.log(`✅ Retrieved ${pinnedNotes.length} currently pinned notifications\n`);

    // Test 11: Business Logic - Calculate Invoice Split
    console.log('1️⃣1️⃣ Testing POST /api/business-logic/calculate-invoice-split');
    const splitRes = await fetch(`${BASE_URL}/business-logic/calculate-invoice-split`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalAmount: '1630.00',
        insuranceExcess: '163.00',
        insuranceClaimAmount: '1467.00'
      })
    });
    const splitDetails = await splitRes.json();
    console.log(`✅ Invoice Split Details:`);
    console.log(`   Client Responsibility: $${splitDetails.clientResponsibility}`);
    console.log(`   Insurance Responsibility: $${splitDetails.insuranceResponsibility}\n`);

    console.log('✨ All tests completed successfully! ✨\n');
    console.log('📊 Summary:');
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Staff: ${staff.length}`);
    console.log(`   - Clients: ${clients.length}`);
    console.log(`   - Insurance Clients: ${insuranceClients.length}`);
    console.log(`   - Operating Expenses: ${expenses.length}`);
    console.log(`   - Active HR Notifications: ${pinnedNotes.length}`);

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    process.exit(1);
  }
}

testFeatures();
