import { registerSchema } from '../../validations/authValidation';

describe('authValidation', () => {
  describe('registerSchema', () => {
    const validData = {
      nomeEmpresa: 'Empresa Teste',
      email: 'teste@empresa.com',
      telefone: '11999999999',
      senha: '123456',
    };

    it('deve validar dados corretos', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    describe('nomeEmpresa', () => {
      it('deve rejeitar nome com menos de 3 caracteres', () => {
        const result = registerSchema.safeParse({ ...validData, nomeEmpresa: 'AB' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe(
            'Nome da empresa deve ter pelo menos 3 caracteres'
          );
        }
      });

      it('deve rejeitar nome com mais de 100 caracteres', () => {
        const result = registerSchema.safeParse({
          ...validData,
          nomeEmpresa: 'A'.repeat(101),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe(
            'Nome da empresa deve ter no máximo 100 caracteres'
          );
        }
      });

      it('deve aceitar nome com exatamente 3 caracteres', () => {
        const result = registerSchema.safeParse({ ...validData, nomeEmpresa: 'ABC' });
        expect(result.success).toBe(true);
      });

      it('deve aceitar nome com exatamente 100 caracteres', () => {
        const result = registerSchema.safeParse({
          ...validData,
          nomeEmpresa: 'A'.repeat(100),
        });
        expect(result.success).toBe(true);
      });

      it('deve rejeitar nome vazio', () => {
        const result = registerSchema.safeParse({ ...validData, nomeEmpresa: '' });
        expect(result.success).toBe(false);
      });
    });

    describe('email', () => {
      it('deve rejeitar email inválido', () => {
        const result = registerSchema.safeParse({ ...validData, email: 'email-invalido' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Email inválido');
        }
      });

      it('deve rejeitar email sem domínio', () => {
        const result = registerSchema.safeParse({ ...validData, email: 'teste@' });
        expect(result.success).toBe(false);
      });

      it('deve aceitar email válido com subdomínio', () => {
        const result = registerSchema.safeParse({
          ...validData,
          email: 'teste@sub.empresa.com.br',
        });
        expect(result.success).toBe(true);
      });
    });

    describe('telefone', () => {
      it('deve rejeitar telefone com menos de 10 dígitos', () => {
        const result = registerSchema.safeParse({ ...validData, telefone: '123456789' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe(
            'Telefone deve ter pelo menos 10 dígitos'
          );
        }
      });

      it('deve rejeitar telefone com mais de 20 caracteres', () => {
        const result = registerSchema.safeParse({
          ...validData,
          telefone: '1'.repeat(21),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Telefone inválido');
        }
      });

      it('deve aceitar telefone com 10 dígitos (fixo)', () => {
        const result = registerSchema.safeParse({ ...validData, telefone: '1133334444' });
        expect(result.success).toBe(true);
      });

      it('deve aceitar telefone com 11 dígitos (celular)', () => {
        const result = registerSchema.safeParse({ ...validData, telefone: '11999999999' });
        expect(result.success).toBe(true);
      });
    });

    describe('senha', () => {
      it('deve rejeitar senha com menos de 6 caracteres', () => {
        const result = registerSchema.safeParse({ ...validData, senha: '12345' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe(
            'Senha deve ter pelo menos 6 caracteres'
          );
        }
      });

      it('deve aceitar senha com exatamente 6 caracteres', () => {
        const result = registerSchema.safeParse({ ...validData, senha: '123456' });
        expect(result.success).toBe(true);
      });

      it('deve aceitar senha longa', () => {
        const result = registerSchema.safeParse({ ...validData, senha: 'senhafortesegura123' });
        expect(result.success).toBe(true);
      });
    });

    describe('campos obrigatórios', () => {
      it('deve rejeitar objeto sem nomeEmpresa', () => {
        const { nomeEmpresa, ...semNome } = validData;
        const result = registerSchema.safeParse(semNome);
        expect(result.success).toBe(false);
      });

      it('deve rejeitar objeto sem email', () => {
        const { email, ...semEmail } = validData;
        const result = registerSchema.safeParse(semEmail);
        expect(result.success).toBe(false);
      });

      it('deve rejeitar objeto sem telefone', () => {
        const { telefone, ...semTelefone } = validData;
        const result = registerSchema.safeParse(semTelefone);
        expect(result.success).toBe(false);
      });

      it('deve rejeitar objeto sem senha', () => {
        const { senha, ...semSenha } = validData;
        const result = registerSchema.safeParse(semSenha);
        expect(result.success).toBe(false);
      });

      it('deve rejeitar objeto vazio', () => {
        const result = registerSchema.safeParse({});
        expect(result.success).toBe(false);
      });
    });

    describe('múltiplos erros', () => {
      it('deve reportar todos os erros de validação', () => {
        const result = registerSchema.safeParse({
          nomeEmpresa: 'AB',
          email: 'invalido',
          telefone: '123',
          senha: '12',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.length).toBeGreaterThanOrEqual(4);
        }
      });
    });
  });
});
