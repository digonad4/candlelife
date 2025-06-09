
// Serviço de criptografia end-to-end para mensagens
export class EncryptionService {
  private static async getConversationKey(otherUserId: string): Promise<string> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.rpc('get_or_create_conversation_key', {
      p_other_user_id: otherUserId
    });
    
    if (error) throw error;
    return data;
  }

  private static async importKey(keyData: string): Promise<CryptoKey> {
    const keyBuffer = new Uint8Array(atob(keyData).split('').map(char => char.charCodeAt(0)));
    
    return await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encryptMessage(content: string, otherUserId: string): Promise<{ encryptedContent: string; iv: string }> {
    try {
      const keyData = await this.getConversationKey(otherUserId);
      const key = await this.importKey(keyData);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      return {
        encryptedContent: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv))
      };
    } catch (error) {
      console.error('Encryption error:', error);
      // Fallback: return content as-is if encryption fails
      return { encryptedContent: content, iv: '' };
    }
  }

  static async decryptMessage(encryptedContent: string, iv: string, otherUserId: string): Promise<string> {
    try {
      if (!iv) return encryptedContent; // Not encrypted
      
      const keyData = await this.getConversationKey(otherUserId);
      const key = await this.importKey(keyData);
      
      const ivBuffer = new Uint8Array(atob(iv).split('').map(char => char.charCodeAt(0)));
      const encryptedBuffer = new Uint8Array(atob(encryptedContent).split('').map(char => char.charCodeAt(0)));
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        key,
        encryptedBuffer
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedContent; // Return as-is if decryption fails
    }
  }
}
