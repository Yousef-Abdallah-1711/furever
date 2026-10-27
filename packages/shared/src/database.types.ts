
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {

  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "account_deletion_requests": {
                  Row: {
                    "cleanup_attempts": number,"completed_at": string | null,"id": string,"last_error": string | null,"requested_at": string,"state": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cleanup_attempts"?: number,"completed_at"?: string | null,"id"?: string,"last_error"?: string | null,"requested_at"?: string,"state"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "cleanup_attempts"?: number,"completed_at"?: string | null,"id"?: string,"last_error"?: string | null,"requested_at"?: string,"state"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [

                  ]
                },"app_config": {
                  Row: {
                    "created_at": string,"key": string,"updated_at": string,"value": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"key": string,"updated_at"?: string,"value": NonNullable<Json>
                  }
                  Update: {
                    "created_at"?: string,"key"?: string,"updated_at"?: string,"value"?: NonNullable<Json>
                  }
                  Relationships: [

                  ]
                },"audit_logs": {
                  Row: {
                    "action": string,"actor_id": string | null,"created_at": string,"diff": Json | null,"entity": string,"entity_id": string | null,"id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"created_at"?: string,"diff"?: Json | null,"entity": string,"entity_id"?: string | null,"id"?: string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"created_at"?: string,"diff"?: Json | null,"entity"?: string,"entity_id"?: string | null,"id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_logs_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"breeds": {
                  Row: {
                    "created_at": string,"id": string,"is_active": boolean,"name_ar": string,"name_en": string,"slug": string,"species": Database["public"]['Enums']["species"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name_ar": string,"name_en": string,"slug": string,"species": Database["public"]['Enums']["species"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name_ar"?: string,"name_en"?: string,"slug"?: string,"species"?: Database["public"]['Enums']["species"],"updated_at"?: string
                  }
                  Relationships: [

                  ]
                },"cities": {
                  Row: {
                    "created_at": string,"id": string,"is_active": boolean,"name_ar": string,"name_en": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name_ar": string,"name_en": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name_ar"?: string,"name_en"?: string,"updated_at"?: string
                  }
                  Relationships: [

                  ]
                },"clinic_staff": {
                  Row: {
                    "clinic_id": string,"created_at": string,"staff_level": Database["public"]['Enums']["staff_level"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "clinic_id": string,"created_at"?: string,"staff_level": Database["public"]['Enums']["staff_level"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "clinic_id"?: string,"created_at"?: string,"staff_level"?: Database["public"]['Enums']["staff_level"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "clinic_staff_clinic_id_fkey"
      columns: ["clinic_id"]
isOneToOne: false
      referencedRelation: "clinics"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "clinic_staff_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"clinics": {
                  Row: {
                    "city_id": string | null,"created_at": string,"id": string,"name_ar": string,"name_en": string,"status": Database["public"]['Enums']["clinic_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "city_id"?: string | null,"created_at"?: string,"id"?: string,"name_ar": string,"name_en": string,"status"?: Database["public"]['Enums']["clinic_status"],"updated_at"?: string
                  }
                  Update: {
                    "city_id"?: string | null,"created_at"?: string,"id"?: string,"name_ar"?: string,"name_en"?: string,"status"?: Database["public"]['Enums']["clinic_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "clinics_city_id_fkey"
      columns: ["city_id"]
isOneToOne: false
      referencedRelation: "cities"
      referencedColumns: ["id"]
    }
                  ]
                },"consents": {
                  Row: {
                    "accepted_at": string,"created_at": string,"id": string,"type": string,"updated_at": string,"user_id": string,"version": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accepted_at"?: string,"created_at"?: string,"id"?: string,"type": string,"updated_at"?: string,"user_id": string,"version": string
                  }
                  Update: {
                    "accepted_at"?: string,"created_at"?: string,"id"?: string,"type"?: string,"updated_at"?: string,"user_id"?: string,"version"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "consents_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"feature_flags": {
                  Row: {
                    "created_at": string,"enabled": boolean,"key": string,"min_app_version": string | null,"platform": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"enabled"?: boolean,"key": string,"min_app_version"?: string | null,"platform"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"enabled"?: boolean,"key"?: string,"min_app_version"?: string | null,"platform"?: string | null,"updated_at"?: string
                  }
                  Relationships: [

                  ]
                },"otp_attempts": {
                  Row: {
                    "cancelled_count": number,"created_at": string,"id": string,"identifier": string,"locked_until": string | null,"updated_at": string,"window_started_at": string | null,"wrong_count": number
                  }
                  ComputedFields: never
                  Insert: {
                    "cancelled_count"?: number,"created_at"?: string,"id"?: string,"identifier": string,"locked_until"?: string | null,"updated_at"?: string,"window_started_at"?: string | null,"wrong_count"?: number
                  }
                  Update: {
                    "cancelled_count"?: number,"created_at"?: string,"id"?: string,"identifier"?: string,"locked_until"?: string | null,"updated_at"?: string,"window_started_at"?: string | null,"wrong_count"?: number
                  }
                  Relationships: [

                  ]
                },"pets": {
                  Row: {
                    "birth_date": string | null,"breed_id": string | null,"color": string | null,"created_at": string,"deleted_at": string | null,"gender": Database["public"]['Enums']["pet_gender"],"id": string,"is_neutered": boolean | null,"microchip_no": string | null,"name": string,"notes": string | null,"owner_id": string,"photo_path": string | null,"species": Database["public"]['Enums']["species"],"updated_at": string,"weight_kg": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "birth_date"?: string | null,"breed_id"?: string | null,"color"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"gender"?: Database["public"]['Enums']["pet_gender"],"id"?: string,"is_neutered"?: boolean | null,"microchip_no"?: string | null,"name": string,"notes"?: string | null,"owner_id"?: string,"photo_path"?: string | null,"species": Database["public"]['Enums']["species"],"updated_at"?: string,"weight_kg"?: number | null
                  }
                  Update: {
                    "birth_date"?: string | null,"breed_id"?: string | null,"color"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"gender"?: Database["public"]['Enums']["pet_gender"],"id"?: string,"is_neutered"?: boolean | null,"microchip_no"?: string | null,"name"?: string,"notes"?: string | null,"owner_id"?: string,"photo_path"?: string | null,"species"?: Database["public"]['Enums']["species"],"updated_at"?: string,"weight_kg"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "pets_breed_species_fkey"
      columns: ["breed_id","species"]
isOneToOne: false
      referencedRelation: "breeds"
      referencedColumns: ["id","species"]
    },{
      foreignKeyName: "pets_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_path": string | null,"city_id": string | null,"created_at": string,"deleted_at": string | null,"email": string,"full_name": string | null,"id": string,"locale": string,"notif_prefs": NonNullable<Json>,"phone": string | null,"role": Database["public"]['Enums']["app_role"],"status": Database["public"]['Enums']["user_status"],"theme": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_path"?: string | null,"city_id"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"email": string,"full_name"?: string | null,"id": string,"locale"?: string,"notif_prefs"?: NonNullable<Json>,"phone"?: string | null,"role"?: Database["public"]['Enums']["app_role"],"status"?: Database["public"]['Enums']["user_status"],"theme"?: string,"updated_at"?: string
                  }
                  Update: {
                    "avatar_path"?: string | null,"city_id"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"email"?: string,"full_name"?: string | null,"id"?: string,"locale"?: string,"notif_prefs"?: NonNullable<Json>,"phone"?: string | null,"role"?: Database["public"]['Enums']["app_role"],"status"?: Database["public"]['Enums']["user_status"],"theme"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_city_id_fkey"
      columns: ["city_id"]
isOneToOne: false
      referencedRelation: "cities"
      referencedColumns: ["id"]
    }
                  ]
                },"push_tokens": {
                  Row: {
                    "created_at": string,"id": string,"last_seen_at": string,"locale": string,"platform": string,"token": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"last_seen_at"?: string,"locale": string,"platform": string,"token": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"last_seen_at"?: string,"locale"?: string,"platform"?: string,"token"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "push_tokens_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"staff_invitations": {
                  Row: {
                    "accepted_at": string | null,"accepted_user_id": string | null,"clinic_id": string,"created_at": string,"email": string,"full_name": string | null,"id": string,"invited_by": string,"revoked_at": string | null,"staff_level": Database["public"]['Enums']["staff_level"]
                  }
                  ComputedFields: never
                  Insert: {
                    "accepted_at"?: string | null,"accepted_user_id"?: string | null,"clinic_id": string,"created_at"?: string,"email": string,"full_name"?: string | null,"id"?: string,"invited_by": string,"revoked_at"?: string | null,"staff_level": Database["public"]['Enums']["staff_level"]
                  }
                  Update: {
                    "accepted_at"?: string | null,"accepted_user_id"?: string | null,"clinic_id"?: string,"created_at"?: string,"email"?: string,"full_name"?: string | null,"id"?: string,"invited_by"?: string,"revoked_at"?: string | null,"staff_level"?: Database["public"]['Enums']["staff_level"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "staff_invitations_clinic_id_fkey"
      columns: ["clinic_id"]
isOneToOne: false
      referencedRelation: "clinics"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "staff_invitations_invited_by_fkey"
      columns: ["invited_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "accept_staff_invitation":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"admin_set_user_status":
{ Args: { "p_reason"?: string,"p_status": Database["public"]['Enums']["user_status"],"p_user_id": string }; Returns: Json
                           },
"can_access_owner_pet_data":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"can_access_pet_storage_object":
{ Args: { "p_bucket_id": string,"p_name": string }; Returns: boolean
                           },
"cancel_account_deletion":
{ Args: { "p_user_id": string }; Returns: Json
                           },
"cancel_staff_invitation":
{ Args: { "p_invitation_id": string }; Returns: undefined
                           },
"complete_owner_profile":
{ Args: { "p_accept_legal_documents": boolean,"p_city_id": string,"p_full_name": string,"p_phone": string,"p_privacy_version": string,"p_terms_version": string }; Returns: Json
                           },
"create_staff_invitation":
{ Args: { "p_clinic_id": string,"p_email": string,"p_full_name": string,"p_staff_level": Database["public"]['Enums']["staff_level"] }; Returns: string
                           },
"custom_access_token_hook":
{ Args: { "event": Json }; Returns: Json
                           },
"delete_pet":
{ Args: { "p_pet_id": string }; Returns: Json
                           },
"get_otp_lock_status":
{ Args: { "p_identifier": string }; Returns: {
              "cancelled_count": number,"is_locked": boolean,"locked_until": string,"wrong_count": number
            }[]
                           },
"is_active_account":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"record_otp_attempt":
{ Args: { "p_identifier": string,"p_outcome": string }; Returns: undefined
                           },
"remove_clinic_staff":
{ Args: { "p_clinic_id": string,"p_user_id": string }; Returns: Json
                           },
"request_account_deletion":
{ Args: { "p_user_id": string }; Returns: Json
                           },
"set_clinic_staff_level":
{ Args: { "p_clinic_id": string,"p_staff_level": Database["public"]['Enums']["staff_level"],"p_user_id": string }; Returns: Json
                           },
"tables_missing_rls":
{ Args: Record<PropertyKey, never>; Returns: {
              "table_name": string
            }[]
                           },
"write_audit_log":
{ Args: { "p_action": string,"p_actor_id": string,"p_diff": Json,"p_entity": string,"p_entity_id": string }; Returns: undefined
                           }
          }
          Enums: {
            "app_role": "owner"|"clinic_staff"|"admin"|"super_admin","clinic_status": "pending"|"active"|"suspended","pet_gender": "male"|"female"|"unknown","species": "cat"|"dog"|"bird"|"rabbit"|"other","staff_level": "manager"|"vet"|"receptionist","user_status": "active"|"suspended"|"deleted"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {

          }
        },"public": {
          Enums: {
            "app_role": ["owner", "clinic_staff", "admin", "super_admin"],"clinic_status": ["pending", "active", "suspended"],"pet_gender": ["male", "female", "unknown"],"species": ["cat", "dog", "bird", "rabbit", "other"],"staff_level": ["manager", "vet", "receptionist"],"user_status": ["active", "suspended", "deleted"]
          }
        }
} as const
