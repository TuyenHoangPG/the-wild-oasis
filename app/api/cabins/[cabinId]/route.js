import { getBookedDatesByCabinId, getCabin } from "@/app/_lib/data-service";

export async function GET(request, { params }) {
  const { cabinId } = params;

  try {
    const [cabin, bookDates] = await Promise.all([
      getCabin(cabinId),
      getBookedDatesByCabinId(cabinId),
    ]);

    return Response.json({
      cabin,
      bookDates,
    });
  } catch (error) {
    return Response.json(
      {
        message: error.message,
      },
      {
        status: 400,
      }
    );
  }
}
