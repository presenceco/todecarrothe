// GERADO por npm run db:tipos. Não edite à mão.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      consignacao_fotos: {
        Row: {
          consignacao_id: string
          created_at: string
          id: string
          ordem: number
          path: string
        }
        Insert: {
          consignacao_id: string
          created_at?: string
          id?: string
          ordem: number
          path: string
        }
        Update: {
          consignacao_id?: string
          created_at?: string
          id?: string
          ordem?: number
          path?: string
        }
        Relationships: [
          {
            foreignKeyName: "consignacao_fotos_consignacao_id_fkey"
            columns: ["consignacao_id"]
            isOneToOne: false
            referencedRelation: "consignacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      consignacoes: {
        Row: {
          ano_fabricacao: number
          ano_modelo: number
          anotacoes: string
          cambio: string
          consentimento_em: string
          consentimento_versao: string
          cor: string
          created_at: string
          detalhes: string
          forma_venda: string
          id: string
          km: number
          marca: string
          modelo: string
          nome: string
          quitado: boolean
          status: string
          updated_at: string
          valor_pretendido: number | null
          versao: string
          whatsapp: string
        }
        Insert: {
          ano_fabricacao: number
          ano_modelo: number
          anotacoes?: string
          cambio: string
          consentimento_em: string
          consentimento_versao: string
          cor: string
          created_at?: string
          detalhes?: string
          forma_venda: string
          id?: string
          km: number
          marca: string
          modelo: string
          nome: string
          quitado: boolean
          status?: string
          updated_at?: string
          valor_pretendido?: number | null
          versao?: string
          whatsapp: string
        }
        Update: {
          ano_fabricacao?: number
          ano_modelo?: number
          anotacoes?: string
          cambio?: string
          consentimento_em?: string
          consentimento_versao?: string
          cor?: string
          created_at?: string
          detalhes?: string
          forma_venda?: string
          id?: string
          km?: number
          marca?: string
          modelo?: string
          nome?: string
          quitado?: boolean
          status?: string
          updated_at?: string
          valor_pretendido?: number | null
          versao?: string
          whatsapp?: string
        }
        Relationships: []
      }
      limites_envio: {
        Row: {
          criado_em: string
          formulario: string
          id: number
          ip_hash: string
        }
        Insert: {
          criado_em?: string
          formulario: string
          id?: never
          ip_hash: string
        }
        Update: {
          criado_em?: string
          formulario?: string
          id?: never
          ip_hash?: string
        }
        Relationships: []
      }
      opcionais: {
        Row: {
          created_at: string
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      pedidos_busca: {
        Row: {
          ano_minimo: number
          anotacoes: string
          consentimento_em: string
          consentimento_versao: string
          created_at: string
          faixa_preco: string
          id: string
          marca_modelo: string
          nome: string
          pagamento: string
          status: string
          tem_troca: boolean
          troca_ano: number | null
          troca_modelo: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          ano_minimo: number
          anotacoes?: string
          consentimento_em: string
          consentimento_versao: string
          created_at?: string
          faixa_preco: string
          id?: string
          marca_modelo: string
          nome: string
          pagamento: string
          status?: string
          tem_troca: boolean
          troca_ano?: number | null
          troca_modelo?: string | null
          updated_at?: string
          whatsapp: string
        }
        Update: {
          ano_minimo?: number
          anotacoes?: string
          consentimento_em?: string
          consentimento_versao?: string
          created_at?: string
          faixa_preco?: string
          id?: string
          marca_modelo?: string
          nome?: string
          pagamento?: string
          status?: string
          tem_troca?: boolean
          troca_ano?: number | null
          troca_modelo?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      simulacoes: {
        Row: {
          consentimento_em: string
          consentimento_versao: string
          cpf: string
          created_at: string
          entrada: number
          id: string
          nascimento: string
          nome: string
          possui_cnh: boolean
          prazo_meses: number
          renda: number
          status: string
          tem_troca: boolean
          troca_ano: number | null
          troca_modelo: string | null
          updated_at: string
          valor_aproximado: number | null
          veiculo_id: string | null
          veiculo_nome: string | null
          veiculo_preco: number | null
          whatsapp: string
        }
        Insert: {
          consentimento_em: string
          consentimento_versao: string
          cpf: string
          created_at?: string
          entrada: number
          id?: string
          nascimento: string
          nome: string
          possui_cnh: boolean
          prazo_meses: number
          renda: number
          status?: string
          tem_troca: boolean
          troca_ano?: number | null
          troca_modelo?: string | null
          updated_at?: string
          valor_aproximado?: number | null
          veiculo_id?: string | null
          veiculo_nome?: string | null
          veiculo_preco?: number | null
          whatsapp: string
        }
        Update: {
          consentimento_em?: string
          consentimento_versao?: string
          cpf?: string
          created_at?: string
          entrada?: number
          id?: string
          nascimento?: string
          nome?: string
          possui_cnh?: boolean
          prazo_meses?: number
          renda?: number
          status?: string
          tem_troca?: boolean
          troca_ano?: number | null
          troca_modelo?: string | null
          updated_at?: string
          valor_aproximado?: number | null
          veiculo_id?: string | null
          veiculo_nome?: string | null
          veiculo_preco?: number | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulacoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculo_fotos: {
        Row: {
          created_at: string
          id: string
          ordem: number
          path: string
          veiculo_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ordem: number
          path: string
          veiculo_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ordem?: number
          path?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculo_fotos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculo_opcionais: {
        Row: {
          opcional_id: string
          veiculo_id: string
        }
        Insert: {
          opcional_id: string
          veiculo_id: string
        }
        Update: {
          opcional_id?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculo_opcionais_opcional_id_fkey"
            columns: ["opcional_id"]
            isOneToOne: false
            referencedRelation: "opcionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculo_opcionais_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano_fabricacao: number
          ano_modelo: number
          cambio: string
          combustivel: string
          consignacao_id: string | null
          cor: string
          created_at: string
          etiqueta: string
          final_placa: string
          id: string
          km: number
          marca: string
          modelo: string
          preco: number
          publicado: boolean
          publicado_em: string | null
          selos: string[]
          slug: string
          status: string
          tipo: string
          updated_at: string
          versao: string
        }
        Insert: {
          ano_fabricacao: number
          ano_modelo: number
          cambio: string
          combustivel: string
          consignacao_id?: string | null
          cor: string
          created_at?: string
          etiqueta?: string
          final_placa: string
          id?: string
          km: number
          marca: string
          modelo: string
          preco: number
          publicado?: boolean
          publicado_em?: string | null
          selos?: string[]
          slug: string
          status?: string
          tipo: string
          updated_at?: string
          versao?: string
        }
        Update: {
          ano_fabricacao?: number
          ano_modelo?: number
          cambio?: string
          combustivel?: string
          consignacao_id?: string | null
          cor?: string
          created_at?: string
          etiqueta?: string
          final_placa?: string
          id?: string
          km?: number
          marca?: string
          modelo?: string
          preco?: number
          publicado?: boolean
          publicado_em?: string | null
          selos?: string[]
          slug?: string
          status?: string
          tipo?: string
          updated_at?: string
          versao?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_consignacao_id_fkey"
            columns: ["consignacao_id"]
            isOneToOne: false
            referencedRelation: "consignacoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      eh_admin: { Args: never; Returns: boolean }
      registrar_envio: {
        Args: {
          p_formulario: string
          p_ip_hash: string
          p_janela: string
          p_limite: number
        }
        Returns: boolean
      }
      veiculo_visivel: { Args: { p_veiculo_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
