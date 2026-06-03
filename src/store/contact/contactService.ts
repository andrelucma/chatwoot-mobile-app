import { apiService } from '@/services/APIService';
import type {
  ContactLabelsAPIResponse,
  ContactLabelsPayload,
  UpdateContactLabelsPayload,
  ContactConversationAPIResponse,
  ContactConversationPayload,
  ContactListResponse,
  SearchContactsPayload,
  CreateContactPayload,
  UpdateContactPayload,
  ContactableInbox,
  ContactableInboxesAPIResponse,
  CreateConversationPayload,
  CreateConversationAPIResponse,
  WhatsAppTemplate,
} from './contactTypes';
import { transformContact, transformConversation, transformInbox } from '@/utils/camelCaseKeys';
import { Contact } from '@/types';

export class ContactService {
  static async searchContacts(payload: SearchContactsPayload): Promise<ContactListResponse> {
    const { q, page = 1 } = payload;
    const trimmedQ = q.trim();
    const response = trimmedQ
      ? await apiService.get<{ meta: object; payload: object[] }>('contacts/search', {
          params: { q: trimmedQ, page, include_contacts: true },
        })
      : await apiService.get<{ meta: object; payload: object[] }>('contacts', {
          params: { page, sort: 'name' },
        });
    const { meta, payload: contacts } = response.data;
    return {
      meta: transformContact(meta) as unknown as { count: number; currentPage: number },
      contacts: (contacts as object[]).map(transformContact) as Contact[],
    };
  }

  static async getContact(contactId: number): Promise<Contact> {
    const response = await apiService.get<{ payload: object }>(`contacts/${contactId}`);
    return transformContact(response.data.payload) as Contact;
  }

  static async createContact(payload: CreateContactPayload): Promise<Contact> {
    const response = await apiService.post<{ payload: { contact: object } }, object>('contacts', {
      name: payload.name,
      email: payload.email,
      phone_number: payload.phoneNumber,
      identifier: payload.identifier,
      inbox_id: payload.inboxId,
      additional_attributes: payload.additionalAttributes
        ? {
            company_name: payload.additionalAttributes.companyName,
            location: payload.additionalAttributes.location,
            city: payload.additionalAttributes.city,
            country: payload.additionalAttributes.country,
          }
        : undefined,
    });
    return transformContact(response.data.payload.contact) as Contact;
  }

  static async updateContact(payload: UpdateContactPayload): Promise<Contact> {
    const { contactId, ...data } = payload;
    const response = await apiService.put<{ payload: object }, object>(`contacts/${contactId}`, {
      name: data.name,
      email: data.email,
      phone_number: data.phoneNumber,
      identifier: data.identifier,
      additional_attributes: data.additionalAttributes
        ? {
            company_name: data.additionalAttributes.companyName,
            location: data.additionalAttributes.location,
            city: data.additionalAttributes.city,
            country: data.additionalAttributes.country,
          }
        : undefined,
    });
    return transformContact(response.data.payload) as Contact;
  }

  static async deleteContact(contactId: number): Promise<void> {
    await apiService.delete(`contacts/${contactId}`);
  }

  static async getContactableInboxes(contactId: number): Promise<ContactableInbox[]> {
    const response = await apiService.get<ContactableInboxesAPIResponse>(
      `contacts/${contactId}/contactable_inboxes`,
    );
    return response.data.payload.map(item => ({
      sourceId: item.source_id,
      inbox: transformInbox(item.inbox),
    }));
  }

  static async createConversation(
    payload: CreateConversationPayload,
  ): Promise<CreateConversationAPIResponse> {
    const { contactId, inboxId, sourceId, message, templateParams } = payload;
    const body: Record<string, unknown> = {
      contact_id: contactId,
      inbox_id: inboxId,
      source_id: sourceId,
    };
    if (templateParams) {
      body.message = {
        template_params: templateParams,
        ...(message ? { content: message } : {}),
      };
    } else if (message) {
      body.message = { content: message };
    }
    const response = await apiService.post<CreateConversationAPIResponse, object>(
      'conversations',
      body,
    );
    return response.data;
  }

  static async getWhatsAppTemplates(inboxId: number): Promise<WhatsAppTemplate[]> {
    const response = await apiService.get<Record<string, unknown>>(`inboxes/${inboxId}`);
    const data = response.data;
    const templates =
      (data.message_templates as WhatsAppTemplate[] | undefined) ||
      ((data.additional_attributes as Record<string, unknown> | undefined)
        ?.message_templates as WhatsAppTemplate[] | undefined) ||
      [];
    return Array.isArray(templates) ? templates : [];
  }

  static async getContactLabels(payload: ContactLabelsPayload) {
    const { contactId } = payload;
    const response = await apiService.get<ContactLabelsAPIResponse>(`contacts/${contactId}/labels`);
    return response.data;
  }

  static async updateContactLabels(
    payload: UpdateContactLabelsPayload,
  ): Promise<ContactLabelsAPIResponse> {
    const { contactId, labels } = payload;
    const response = await apiService.post<ContactLabelsAPIResponse>(
      `contacts/${contactId}/labels`,
      { labels },
    );
    return response.data;
  }

  static async getContactConversations(
    payload: ContactConversationPayload,
  ): Promise<ContactConversationAPIResponse> {
    const { contactId } = payload;
    const response = await apiService.get<ContactConversationAPIResponse>(
      `contacts/${contactId}/conversations`,
    );
    const transformedResponse = response.data.payload.map(transformConversation);
    return {
      payload: transformedResponse,
    };
  }
}
