const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/profile - Perfil do usuário
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = @param0',
      [req.user.id]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user: result.recordset[0] });
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// PUT /api/users/profile - Atualizar perfil
router.put('/profile', authMiddleware, [
  body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    const result = await query(
      `UPDATE users SET name = @param0, updated_at = GETDATE()
       OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
       WHERE id = @param1`,
      [name, req.user.id]
    );

    res.json({ 
      message: 'Perfil atualizado com sucesso',
      user: result.recordset[0] 
    });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// PUT /api/users/password - Alterar senha
router.put('/password', authMiddleware, [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Buscar senha atual
    const userResult = await query(
      'SELECT password FROM users WHERE id = @param0',
      [req.user.id]
    );

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const isValid = await bcrypt.compare(currentPassword, userResult.recordset[0].password);
    if (!isValid) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    // Atualizar senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query(
      'UPDATE users SET password = @param0, updated_at = GETDATE() WHERE id = @param1',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error('Erro ao alterar senha:', err);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

// GET /api/users - Lista usuários paginada (admin only)
// Query params: page (1-based), pageSize, search, role
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(req.query.pageSize) || 15));
    const offset = (page - 1) * pageSize;
    const search = (req.query.search || '').trim();
    const role = req.query.role && req.query.role !== 'all' ? req.query.role : null;

    let whereClause = 'WHERE 1=1';
    const params = [];
    if (search) {
      whereClause += ` AND (name LIKE @param${params.length} OR email LIKE @param${params.length})`;
      params.push(`%${search}%`);
    }
    if (role) {
      whereClause += ` AND role = @param${params.length}`;
      params.push(role);
    }

    // Total
    const countResult = await query(
      `SELECT COUNT(*) AS total FROM users ${whereClause}`,
      params
    );
    const total = countResult.recordset[0].total;

    // Página
    const rowsResult = await query(
      `SELECT id, name, email, role, created_at
         FROM users
         ${whereClause}
         ORDER BY created_at DESC
         OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`,
      params
    );

    res.json({
      users: rowsResult.recordset,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

module.exports = router;
