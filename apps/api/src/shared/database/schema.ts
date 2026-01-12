import { csrEvents } from 'src/modules/csr-project/infrastructure/schema/csr.event.schema';
import { users } from 'src/modules/user/infrastructure/schema/user.schema';
import { businesses } from 'src/modules/bussiness/infrastructure/schema/business.schema';
import { organizers } from 'src/modules/organizer/infrastructure/schema/organizer.schema';
import { admins } from 'src/modules/admin/infrastructure/schema/admin.schema';

export const CsrEventsTable = csrEvents;
export const UsersTable = users;
export const BussinessesTable = businesses;
export const OrganizationsTable = organizers;
export const AdminTable = admins;
