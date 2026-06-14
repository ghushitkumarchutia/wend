import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createTripSchema,
  updateTripSchema,
  inviteMemberSchema,
  createEventSchema,
  updateEventSchema,
  logExpenseSchema,
  updateExpenseSchema,
  settleUpSchema,
  uploadConfirmSchema,
  sendMessageSchema,
  editMessageSchema,
  createPollSchema,
  castVoteSchema,
  updatePreferencesSchema,
  createTemplateSchema,
  updateTemplateSchema,
  changeVisibilitySchema,
  cloneTemplateSchema,
  updateProfileSchema,
  changePasswordSchema,
  changeEmailSchema,
  deleteAccountConfirmSchema,
} from '@wend/shared';

export const registry = new OpenAPIRegistry();

registry.register('SignUp', signUpSchema);
registry.register('SignIn', signInSchema);
registry.register('ForgotPassword', forgotPasswordSchema);
registry.register('ResetPassword', resetPasswordSchema);

registry.register('CreateTrip', createTripSchema);
registry.register('UpdateTrip', updateTripSchema);
registry.register('InviteMember', inviteMemberSchema);

registry.register('CreateEvent', createEventSchema);
registry.register('UpdateEvent', updateEventSchema);

registry.register('LogExpense', logExpenseSchema);
registry.register('UpdateExpense', updateExpenseSchema);
registry.register('SettleUp', settleUpSchema);

registry.register('UploadConfirm', uploadConfirmSchema);

registry.register('SendMessage', sendMessageSchema);
registry.register('EditMessage', editMessageSchema);

registry.register('CreatePoll', createPollSchema);
registry.register('CastVote', castVoteSchema);

registry.register('UpdatePreferences', updatePreferencesSchema);

registry.register('CreateTemplate', createTemplateSchema);
registry.register('UpdateTemplate', updateTemplateSchema);
registry.register('ChangeVisibility', changeVisibilitySchema);
registry.register('CloneTemplate', cloneTemplateSchema);

registry.register('UpdateProfile', updateProfileSchema);
registry.register('ChangePassword', changePasswordSchema);
registry.register('ChangeEmail', changeEmailSchema);
registry.register('DeleteAccountConfirm', deleteAccountConfirmSchema);
