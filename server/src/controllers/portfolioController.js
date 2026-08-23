import { supabase } from '../config/supabase.js';

/**
 * Buscar todas as mídias do portfólio
 * GET /api/portfolio
 */
export async function listarPortfolio(req, res) {
  try {
    const { data: midias, error } = await supabase
      .from('midias_portfolio')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      midias: midias || [],
    });
  } catch (error) {
    console.error('Erro ao listar portfólio:', error);
    return res.status(500).json({
      error: 'Erro ao buscar mídias do portfólio',
    });
  }
}

/**
 * Upload de nova mídia no portfólio (rota administrativa)
 * POST /api/portfolio
 */
export async function uploadMidia(req, res) {
  try {
    const { tipo, file } = req.body;

    // Validar extensão do arquivo
    const extensoesPermitidas = {
      imagem: ['.jpg', '.jpeg', '.png', '.webp'],
      video: ['.mp4', '.mkv', '.mov'],
    };

    const extensao = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    
    if (!extensao || !extensoesPermitidas[tipo]?.includes(extensao)) {
      return res.status(400).json({
        error: `Extensão de arquivo não permitida. Use: ${extensoesPermitidas[tipo]?.join(', ')}`,
      });
    }

    // Upload para Supabase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const bucket = tipo === 'imagem' ? 'portfolio-imagens' : 'portfolio-videos';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Salvar registro no banco de dados
    // Schema real: tipo aceita 'FOTO'/'VIDEO' (maiúsculo), url em url_midia, nome em titulo
    const { data: midia, error: dbError } = await supabase
      .from('midias_portfolio')
      .insert([{
        tipo: tipo === 'imagem' ? 'FOTO' : 'VIDEO',
        titulo: file.name,
        url_midia: urlData.publicUrl,
      }])
      .select()
      .single();

    if (dbError) {
      // Tentar deletar o arquivo do storage se falhar ao salvar no banco
      await supabase.storage.from(bucket).remove([fileName]);
      throw dbError;
    }

    return res.status(201).json({
      message: 'Mídia enviada com sucesso',
      midia,
    });
  } catch (error) {
    console.error('Erro ao fazer upload de mídia:', error);
    return res.status(500).json({
      error: 'Erro ao processar upload',
    });
  }
}

/**
 * Deletar mídia do portfólio (rota administrativa)
 * DELETE /api/portfolio/:id
 */
export async function deletarMidia(req, res) {
  try {
    const { id } = req.params;

    // Buscar informações da mídia
    const { data: midia, error: fetchError } = await supabase
      .from('midias_portfolio')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !midia) {
      return res.status(404).json({
        error: 'Mídia não encontrada',
      });
    }

    // Extrair nome do arquivo da URL
    const fileName = midia.url_midia.split('/').pop();
    const bucket = midia.tipo === 'FOTO' ? 'portfolio-imagens' : 'portfolio-videos';

    // Deletar arquivo do storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (storageError) {
      console.error('Erro ao deletar arquivo do storage:', storageError);
    }

    // Deletar registro do banco de dados
    const { error: deleteError } = await supabase
      .from('midias_portfolio')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json({
      message: 'Mídia deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar mídia:', error);
    return res.status(500).json({
      error: 'Erro ao deletar mídia',
    });
  }
}
