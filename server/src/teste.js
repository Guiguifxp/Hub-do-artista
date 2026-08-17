import { supabase } from './config/supabase.js';

async function runIntegrationTest() {
  console.log('Starting Supabase integration test...');

  let insertedId = null;

  try {
    // 1. INSERT: Inserir registro temporário (enviando também o id explicitamente)
    const testId = Math.floor(Math.random() * 1000000) + 1;
    console.log(`Performing INSERT into "solicitacoes_agendamento" with ID: ${testId}...`);
    
    const { data: insertData, error: insertError } = await supabase
      .from('solicitacoes_agendamento')
      .insert([
        {
          id: testId,
          usuario_id: testId,
          nome_cliente: 'Teste Integracao',
          whatsapp_cliente: '11999999999',
          email_cliente: 'jose@gmail.com',
          datas_selecionadas: '2026-08-12',
          horario_inicio: '14:00:00',
          horario_fim: '18:00:00',
          status: 'PENDENTE',
          detalhes_adicionais: 'meu cachorro tá doente',
          notificacao_whatsapp_enviada: 'false',
          notificacao_email_enviada: 'true'

        }
      ])
      .select();

    if (insertError) {
      throw new Error(`INSERT failed: ${insertError.message}`);
    }

    if (!insertData || insertData.length === 0) {
      throw new Error('INSERT failed: No data returned.');
    }

    insertedId = insertData[0].id;
    console.log(`[SUCCESS] Record inserted with ID: ${insertedId}`);

    // 2. SELECT: Buscar o registro recém-criado pelo ID
    console.log(`Performing SELECT for record ID: ${insertedId}...`);
    const { data: selectData, error: selectError } = await supabase
      .from('solicitacoes_agendamento')
      .select('*')
      .eq('id', insertedId)
      .single();

    if (selectError) {
      throw new Error(`SELECT failed: ${selectError.message}`);
    }

    if (!selectData) {
      throw new Error(`SELECT failed: Record with ID ${insertedId} not found.`);
    }

    console.log('[SUCCESS] Record retrieved successfully:', selectData);

    // 3. DELETE: Deletar registro de teste
    console.log(`Performing DELETE for record ID: ${insertedId}...`);
    const { error: deleteError } = await supabase
      .from('solicitacoes_agendamento')
      .delete()
      .eq('id', insertedId);

    if (deleteError) {
      throw new Error(`DELETE failed: ${deleteError.message}`);
    }

    console.log(`[SUCCESS] Record ID ${insertedId} deleted successfully. Database state restored.`);
    console.log('Integration test completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`[FAILURE] Integration test failed: ${error.message}`);

    // Cleanup attempt if insertion succeeded but subsequent step failed
    if (insertedId) {
      console.log(`Attempting cleanup for orphaned record ID: ${insertedId}...`);
      await supabase.from('solicitacoes_agendamento').delete().eq('id', insertedId);
    }

    process.exit(1);
  }
}

runIntegrationTest();
