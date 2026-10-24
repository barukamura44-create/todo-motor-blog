import axios from 'axios';

async function testUserFlows() {
  console.log('=== STARTING VISUAL & END-TO-END FLOW TESTS ===\n');

  // 1. Homepage HTML
  try {
    const resHome = await axios.get('http://localhost:3000/');
    console.log('✅ 1. Homepage loaded (HTTP 200). Length:', resHome.data.length, 'bytes');
  } catch (err: any) {
    console.error('❌ 1. Homepage failed:', err.message);
  }

  // 2. Categories List (tRPC)
  try {
    const resCat = await axios.get('http://localhost:3000/api/trpc/categories.list');
    console.log('✅ 2. Categories tRPC API:', resCat.data.result.data.json.length, 'categories returned.');
  } catch (err: any) {
    console.error('❌ 2. Categories tRPC API failed:', err.message);
  }

  // 3. Posts List (tRPC)
  try {
    const resPosts = await axios.get('http://localhost:3000/api/trpc/posts.list?input=' + encodeURIComponent(JSON.stringify({ json: { limit: 10, offset: 0 } })));
    const posts = resPosts.data.result.data.json;
    console.log('✅ 3. Posts List tRPC API:', posts.length, 'published posts returned.');
    if (posts.length > 0) {
      console.log('   Sample Post Title:', posts[0].title);
      console.log('   Sample Post Slug:', posts[0].slug);
    }
  } catch (err: any) {
    console.error('❌ 3. Posts List tRPC API failed:', err.message);
  }

  // 4. Search Posts (tRPC)
  try {
    const resSearch = await axios.get('http://localhost:3000/api/trpc/posts.search?input=' + encodeURIComponent(JSON.stringify({ json: { query: 'Caminhão', limit: 10, offset: 0 } })));
    const searchData = resSearch.data.result.data.json;
    console.log('✅ 4. Search Posts tRPC API:', searchData.length, 'results for query "Caminhão".');
  } catch (err: any) {
    console.error('❌ 4. Search Posts failed:', err.message);
  }

  // 5. Submit Lead (tRPC Mutation)
  try {
    const resLead = await axios.post('http://localhost:3000/api/trpc/leads.submit', {
      json: {
        name: 'João Silva',
        phone: '11999998888',
        email: 'joao.silva@exemplo.com',
        segment: 'anunciante',
        categoryInterest: 'Veículos',
        message: 'Quero anunciar minha frota de caminhões.',
        source: 'test_script'
      }
    });
    console.log('✅ 5. Lead Submission tRPC API:', resLead.data.result.data.json);
  } catch (err: any) {
    console.error('❌ 5. Lead Submission failed:', err.message);
  }

  // 6. Admin Page HTML
  try {
    const resAdmin = await axios.get('http://localhost:3000/admin');
    console.log('✅ 6. Admin Dashboard loaded (HTTP 200). Length:', resAdmin.data.length, 'bytes');
  } catch (err: any) {
    console.error('❌ 6. Admin Dashboard failed:', err.message);
  }

  console.log('\n=== E2E FLOW TEST COMPLETE ===');
}

testUserFlows();
