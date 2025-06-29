// Utilitários para criptografia e assinatura digital
export interface DigitalSignature {
  signature: string
  publicKey: string
  algorithm: string
  hash: string
  timestamp: string
}

export interface SignedData {
  expenseId: string
  title: string
  amount: number
  submittedBy: string
  signedBy: string
  timestamp: string
}

// Função para gerar par de chaves RSA
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
  )
}

// Função para assinar dados
export async function signData(data: string, privateKey: CryptoKey): Promise<DigitalSignature> {
  try {
    // Converter dados para ArrayBuffer
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)

    // Assinar os dados
    const signature = await window.crypto.subtle.sign(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      privateKey,
      dataBuffer
    )

    // Exportar chave pública
    const publicKey = await window.crypto.subtle.exportKey("spki", privateKey)
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)))

    // Converter assinatura para base64
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

    return {
      signature: signatureBase64,
      publicKey: publicKeyBase64,
      algorithm: "RSA-PSS",
      hash: "SHA-256",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Erro ao assinar dados:", error)
    throw new Error("Falha ao gerar assinatura digital")
  }
}

// Função para verificar assinatura
export async function verifySignature(
  signature: DigitalSignature,
  data: string
): Promise<boolean> {
  try {
    // Importar chave pública
    const publicKeyBuffer = Uint8Array.from(atob(signature.publicKey), (c) => c.charCodeAt(0))
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      publicKeyBuffer,
      {
        name: "RSA-PSS",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    )

    // Converter assinatura de base64
    const signatureBuffer = Uint8Array.from(atob(signature.signature), (c) => c.charCodeAt(0))

    // Converter dados para ArrayBuffer
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)

    // Verificar assinatura
    return await window.crypto.subtle.verify(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      publicKey,
      signatureBuffer,
      dataBuffer
    )
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error)
    return false
  }
}

// Função para criar dados assinados
export function createSignedData(
  expenseId: string,
  title: string,
  amount: number,
  submittedBy: string,
  signedBy: string
): SignedData {
  return {
    expenseId,
    title,
    amount,
    submittedBy,
    signedBy,
    timestamp: new Date().toISOString(),
  }
}

// Função para verificar integridade dos dados
export function verifyDataIntegrity(signedData: SignedData, originalExpense: any): boolean {
  return (
    signedData.expenseId === originalExpense._id &&
    signedData.title === originalExpense.title &&
    signedData.amount === originalExpense.amount &&
    signedData.submittedBy === originalExpense.submittedBy.email
  )
}

// Função para simular assinatura digital (para desenvolvimento)
export function simulateDigitalSignature(data: string): DigitalSignature {
  const mockSignature = btoa(`mock_signature_${Date.now()}_${Math.random()}`)
  const mockPublicKey = btoa(`mock_public_key_${Date.now()}`)
  
  return {
    signature: mockSignature,
    publicKey: mockPublicKey,
    algorithm: "RSA-PSS",
    hash: "SHA-256",
    timestamp: new Date().toISOString(),
  }
}

// Função para simular verificação (para desenvolvimento)
export function simulateSignatureVerification(): boolean {
  // Simula verificação bem-sucedida 95% das vezes
  return Math.random() > 0.05
} 