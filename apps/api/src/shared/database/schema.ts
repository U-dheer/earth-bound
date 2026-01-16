import { csrEvents } from 'src/modules/csr-project/infrastructure/schema/csr.event.schema';
import { users } from 'src/modules/user/infrastructure/schema/user.schema';
import { businesses } from 'src/modules/bussiness/infrastructure/schema/business.schema';
import { organizers } from 'src/modules/organizer/infrastructure/schema/organizer.schema';
import { admins } from 'src/modules/admin/infrastructure/schema/admin.schema';
import { offers } from 'src/modules/offer/infrastructure/schema/offer.schema';
import { donations } from 'src/modules/donation/infrastructure/schema/donation.schema';
import { UserOffers } from 'src/modules/user_offers/infrastructure/schema/user_offer.schema';

export const CsrEventsTable = csrEvents;
export const UsersTable = users;
export const BussinessesTable = businesses;
export const OrganizationsTable = organizers;
export const AdminTable = admins;
export const OfferTable = offers;
export const DonationTable = donations;
export const UserOfferTable = UserOffers;
