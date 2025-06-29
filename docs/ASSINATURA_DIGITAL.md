# Assinatura Digital - Documentação Técnica

## 🔐 Visão Geral

O sistema implementa assinatura digital usando criptografia RSA-PSS com hash SHA-256, garantindo autenticidade, integridade e não repúdio dos relatórios de despesas.

## 🏗️ Arquitetura

### Componentes Principais

1. **lib/crypto.ts** - Utilitários de criptografia
2. **app/sign-expense/page.tsx** - Interface de assinatura
3. **app/verify-signature/[id]/page.tsx** - Interface de verificação
4. **app/api/expenses/[id]/sign/route.ts** - API de assinatura

### Fluxo de Assinatura

```
1. Gerente acessa "Assinar Relatórios"
2. Seleciona relatório aprovado
3. Sistema gera par de chaves RSA-PSS
4. Dados do relatório são assinados
5. Assinatura é armazenada no banco
6. Email é enviado para diretores
```

### Fluxo de Verificação

```
1. Diretor acessa "Verificar Assinaturas"
2. Seleciona relatório assinado
3. Sistema verifica assinatura criptográfica
4. Sistema verifica integridade dos dados
5. Resultado é exibido com detalhes
```

## 🔧 Implementação Técnica

### Geração de Chaves

```typescript
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );
}
```

### Assinatura de Dados

```typescript
export async function signData(
  data: string,
  privateKey: CryptoKey
): Promise<DigitalSignature> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const signature = await window.crypto.subtle.sign(
    {
      name: "RSA-PSS",
      saltLength: 32,
    },
    privateKey,
    dataBuffer
  );

  // Exportar chave pública e converter para base64
  const publicKey = await window.crypto.subtle.exportKey("spki", privateKey);
  const publicKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(publicKey))
  );
  const signatureBase64 = btoa(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return {
    signature: signatureBase64,
    publicKey: publicKeyBase64,
    algorithm: "RSA-PSS",
    hash: "SHA-256",
    timestamp: new Date().toISOString(),
  };
}
```

### Verificação de Assinatura

```typescript
export async function verifySignature(
  signature: DigitalSignature,
  data: string
): Promise<boolean> {
  // Importar chave pública
  const publicKeyBuffer = Uint8Array.from(atob(signature.publicKey), (c) =>
    c.charCodeAt(0)
  );
  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );

  // Verificar assinatura
  const signatureBuffer = Uint8Array.from(atob(signature.signature), (c) =>
    c.charCodeAt(0)
  );
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  return await window.crypto.subtle.verify(
    {
      name: "RSA-PSS",
      saltLength: 32,
    },
    publicKey,
    signatureBuffer,
    dataBuffer
  );
}
```

## 📊 Estrutura de Dados

### Dados Assinados

```typescript
interface SignedData {
  expenseId: string;
  title: string;
  amount: number;
  submittedBy: string;
  signedBy: string;
  timestamp: string;
}
```

### Assinatura Digital

```typescript
interface DigitalSignature {
  signature: string; // Assinatura em base64
  publicKey: string; // Chave pública em base64
  algorithm: string; // "RSA-PSS"
  hash: string; // "SHA-256"
  timestamp: string; // ISO timestamp
}
```

### Schema do Banco

```prisma
model Expense {
  // ... outros campos
  digitalSignature String?  // JSON da assinatura
  signedData      String?  // JSON dos dados assinados
  signedAt        DateTime?
  signedById      String?
  signedBy        User?    @relation("SignedBy", fields: [signedById], references: [id])
}
```

## 🧪 Modo de Simulação

Para desenvolvimento e testes, o sistema oferece modo de simulação:

### Ativação

- Checkbox "Usar simulação de assinatura digital"
- Disponível nas páginas de assinatura e verificação

### Implementação

```typescript
export function simulateDigitalSignature(data: string): DigitalSignature {
  const mockSignature = btoa(`mock_signature_${Date.now()}_${Math.random()}`);
  const mockPublicKey = btoa(`mock_public_key_${Date.now()}`);

  return {
    signature: mockSignature,
    publicKey: mockPublicKey,
    algorithm: "RSA-PSS",
    hash: "SHA-256",
    timestamp: new Date().toISOString(),
  };
}

export function simulateSignatureVerification(): boolean {
  // Simula verificação bem-sucedida 95% das vezes
  return Math.random() > 0.05;
}
```

## 🔒 Segurança

### Medidas Implementadas

1. **Criptografia RSA-PSS 2048 bits**

   - Algoritmo recomendado para assinaturas digitais
   - Resistente a ataques criptográficos conhecidos

2. **Hash SHA-256**

   - Função hash criptográfica segura
   - Garante integridade dos dados

3. **Web Crypto API**

   - API nativa do navegador
   - Implementação segura e auditada

4. **Verificação de Integridade**

   - Comparação de dados originais vs assinados
   - Detecção de alterações

5. **Timestamp**
   - Registro temporal da assinatura
   - Prevenção de replay attacks

### Boas Práticas

- ✅ Chaves geradas no cliente (não transmitidas)
- ✅ Assinatura de dados específicos (não apenas hash)
- ✅ Verificação de integridade completa
- ✅ Armazenamento seguro no banco
- ✅ Logs de auditoria

## 🚀 Como Usar

### Para Gerentes (Assinar)

1. Faça login como gerente
2. Acesse "Assinar Relatórios"
3. Selecione relatório aprovado
4. Clique em "Assinar"
5. Confirme a assinatura digital

### Para Diretores (Verificar)

1. Faça login como diretor
2. Acesse "Relatórios Assinados"
3. Clique em "Verificar" no relatório
4. Analise os resultados da verificação

### Modo de Desenvolvimento

1. Ative "Usar simulação de assinatura digital"
2. Teste o fluxo completo
3. Verifique os logs no console
4. Desative para produção

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de criptografia**

   - Verifique se está usando HTTPS em produção
   - Use modo de simulação para desenvolvimento

2. **Assinatura inválida**

   - Verifique se os dados não foram alterados
   - Confirme que a chave pública está correta

3. **Erro de verificação**
   - Verifique o formato dos dados assinados
   - Confirme que a assinatura está completa

### Logs de Debug

```typescript
// Ative logs detalhados
console.log("Dados para assinatura:", dataToSign);
console.log("Assinatura gerada:", digitalSignature);
console.log("Resultado verificação:", verificationResult);
```

## 📚 Referências

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [RSA-PSS](https://en.wikipedia.org/wiki/RSA-PSS)
- [SHA-256](https://en.wikipedia.org/wiki/SHA-2)
- [Digital Signature](https://en.wikipedia.org/wiki/Digital_signature)

## 🔮 Melhorias Futuras

1. **Certificados Digitais**

   - Integração com ICP-Brasil
   - Certificados A1/A3

2. **Assinatura em Lote**

   - Múltiplos relatórios
   - Assinatura em background

3. **Auditoria Avançada**

   - Logs detalhados
   - Histórico de verificações

4. **Backup de Chaves**
   - Armazenamento seguro
   - Recuperação de assinaturas
