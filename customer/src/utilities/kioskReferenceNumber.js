export const createKioskReferenceNumber = () =>
  String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
