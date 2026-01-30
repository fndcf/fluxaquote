import { getTenantDb } from '../../utils/tenantDb';
import { db } from '../../config/firebase';

// O mock do firebase já é feito no setup.ts global

describe('tenantDb', () => {
  const mockCollection = jest.fn();
  const mockDoc = jest.fn().mockReturnValue({
    collection: mockCollection,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (db.collection as jest.Mock).mockReturnValue({
      doc: mockDoc,
    });
  });

  describe('getTenantDb', () => {
    it('deve retornar objeto com collection, tenantRef e tenantId', () => {
      const tenantId = 'tenant-123';
      const result = getTenantDb(tenantId);

      expect(result).toHaveProperty('collection');
      expect(result).toHaveProperty('tenantRef');
      expect(result).toHaveProperty('tenantId');
    });

    it('deve retornar o tenantId correto', () => {
      const tenantId = 'tenant-abc';
      const result = getTenantDb(tenantId);

      expect(result.tenantId).toBe('tenant-abc');
    });

    it('deve acessar a coleção tenants com o tenantId correto', () => {
      const tenantId = 'tenant-456';
      getTenantDb(tenantId);

      expect(db.collection).toHaveBeenCalledWith('tenants');
      expect(mockDoc).toHaveBeenCalledWith('tenant-456');
    });

    it('deve criar subcollection ao chamar collection()', () => {
      const tenantId = 'tenant-789';
      const tenantDb = getTenantDb(tenantId);

      tenantDb.collection('clientes');

      expect(mockCollection).toHaveBeenCalledWith('clientes');
    });

    it('deve criar subcollections diferentes para cada chamada', () => {
      const tenantId = 'tenant-xyz';
      const tenantDb = getTenantDb(tenantId);

      tenantDb.collection('clientes');
      tenantDb.collection('orcamentos');
      tenantDb.collection('servicos');

      expect(mockCollection).toHaveBeenCalledTimes(3);
      expect(mockCollection).toHaveBeenCalledWith('clientes');
      expect(mockCollection).toHaveBeenCalledWith('orcamentos');
      expect(mockCollection).toHaveBeenCalledWith('servicos');
    });

    it('deve retornar tenantRef apontando para o doc do tenant', () => {
      const mockDocRef = { collection: mockCollection };
      mockDoc.mockReturnValue(mockDocRef);

      const tenantId = 'tenant-ref-test';
      const result = getTenantDb(tenantId);

      expect(result.tenantRef).toBe(mockDocRef);
    });
  });
});
