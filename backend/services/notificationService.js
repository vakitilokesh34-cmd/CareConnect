const Notification = require('../models/Notification');

const createNotification = async ({
  user,
  title,
  message = '',
  type = 'SYSTEM',
  relatedResource = null,
}) => {
  try {
    return await Notification.create({
      user,
      title,
      message,
      type,
      relatedResource: relatedResource
        ? { model: relatedResource.model, id: relatedResource.id }
        : null,
    });
  } catch (error) {
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

const notifyProviderOfRequest = async (providerId, requestId, requestTitle) =>
  createNotification({
    user: providerId,
    title: 'New matching service request',
    message: `A new service request "${requestTitle}" matches your skills. Submit a quote now.`,
    type: 'REQUEST',
    relatedResource: { model: 'ServiceRequest', id: requestId },
  });

const notifyProviderOfBooking = async (providerId, bookingId) =>
  createNotification({
    user: providerId,
    title: 'You have a new booking',
    message: 'A customer has booked you. Please review and accept the job.',
    type: 'BOOKING',
    relatedResource: { model: 'Booking', id: bookingId },
  });

const notifyCustomerOfQuote = async (customerId, quoteId, businessName, price) =>
  createNotification({
    user: customerId,
    title: 'New quotation received',
    message: `${businessName} quoted ${price} for your service request.`,
    type: 'QUOTE',
    relatedResource: { model: 'Quote', id: quoteId },
  });

const notifyCustomerOfBooking = async (customerId, bookingId) =>
  createNotification({
    user: customerId,
    title: 'Booking confirmed',
    message: 'Your booking has been created successfully. Track progress in My Bookings.',
    type: 'BOOKING',
    relatedResource: { model: 'Booking', id: bookingId },
  });

const notifyBookingStatusChange = async (booking, title, message) => {
  const [customerId, providerUserId] = [booking.customer, booking.provider?.user ?? booking.provider];
  return Promise.all([
    createNotification({
      user: booking.customer,
      title,
      message,
      type: 'BOOKING',
      relatedResource: { model: 'Booking', id: booking._id },
    }),
    providerUserId
      ? createNotification({
          user: providerUserId,
          title,
          message,
          type: 'BOOKING',
          relatedResource: { model: 'Booking', id: booking._id },
        })
      : null,
  ]);
};

const notifyDisputeUpdate = async (userId, disputeId, title, message) =>
  createNotification({
    user: userId,
    title: title || 'Dispute updated',
    message,
    type: 'DISPUTE',
    relatedResource: { model: 'Dispute', id: disputeId },
  });

const notifyQuoteDecision = async (providerUserId, quote, accepted) =>
  createNotification({
    user: providerUserId,
    title: accepted ? 'Your quote was accepted' : 'Your quote was not selected',
    message: accepted
      ? `Your quote of ${quote.estimatedPrice} was accepted by the customer.`
      : 'The customer did not select your quote for this request.',
    type: 'QUOTE',
    relatedResource: { model: 'Quote', id: quote._id },
  });

module.exports = {
  createNotification,
  notifyProviderOfRequest,
  notifyProviderOfBooking,
  notifyCustomerOfQuote,
  notifyCustomerOfBooking,
  notifyBookingStatusChange,
  notifyDisputeUpdate,
  notifyQuoteDecision,
};