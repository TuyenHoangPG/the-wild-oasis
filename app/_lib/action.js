"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import {
  createBooking,
  deleteBooking,
  getBookedDatesByCabinId,
  getBooking,
  getBookings,
  updateBooking,
  updateGuest,
} from "./data-service";
import { redirect } from "next/navigation";
import { isAlreadyBooked } from "./utils";

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateProfileAction(formData) {
  const session = await auth();
  if (!session) {
    throw new Error("User not authenticated");
  }

  const nationalId = formData.get("nationalId");
  const nationalityForm = formData.get("nationality");
  const [nationality, countryFlag] = nationalityForm?.split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalId)) {
    throw new Error("Invalid national ID");
  }

  const updateData = {
    nationality,
    countryFlag,
    nationalId,
  };

  await updateGuest(session.user.guestId, updateData);

  revalidatePath("/account/profile");
}

export async function deleteReservationAction(bookingId) {
  const session = await auth();
  if (!session) {
    throw new Error("User not authenticated");
  }

  const guestBooking = await getBookings(session.user.guestId);
  if (!guestBooking.some((booking) => booking.id === bookingId)) {
    throw new Error("Booking not found");
  }

  await deleteBooking(bookingId);

  revalidatePath("/account/reservations");
}

export async function updateBookingAction(formData) {
  const session = await auth();
  if (!session) {
    throw new Error("User not authenticated");
  }

  const bookingId = Number(formData.get("bookingId"));
  const numGuests = formData.get("numGuests");
  const observations = formData.get("observations");

  const booking = await getBooking(bookingId);
  if (booking?.guestId !== session.user.guestId) {
    throw new Error("Cannot update this booking");
  }

  const updateData = {
    numGuests: Number(numGuests),
    observations: observations.slice(0, 1000),
  };

  await updateBooking(bookingId, updateData);

  revalidatePath("/account/reservations");
  revalidatePath(`/account/reservations/edit/${bookingId}`);

  redirect("/account/reservations");
}

export async function createBookingAction(bookingData, formData) {
  console.log("🚀 ~ createBookingAction ~ bookingData:", bookingData);
  console.log("🚀 ~ createBookingAction ~ formData:", formData);
  const session = await auth();
  if (!session) {
    throw new Error("User not authenticated");
  }

  const numGuests = Number(formData.get("numGuests")) ?? 1;
  const observations = formData.get("observations");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests,
    observations: observations.slice(0, 1000),
    extraPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const bookDates = await getBookedDatesByCabinId(bookingData.cabinId);
  const invalidBookDate = isAlreadyBooked(
    {
      from: newBooking.startDate,
      to: newBooking.endDate,
    },
    bookDates
  );

  if (invalidBookDate) {
    throw new Error("Cabin is already booked for this period");
  }

  console.log("🚀 ~ createBookingAction ~ newBooking:", newBooking);

  await createBooking(newBooking);

  revalidatePath(`/cabins/${bookingData.cabinId}`);

  redirect("/cabins/thank-you");
}
