import { DonationsByMonth, Recipient, TopDonators } from '@interfaces/recipient.interface';
import { HttpException } from '@exceptions/HttpException';
import { Prisma } from '@prisma/client';
import prismaClient from '@databases/client';

class RecipientService {
  public async getRecipientData(recId: string): Promise<any> {
    // First check if rec exists (fetch recinfo such as name, industry)
    const recInfo: Recipient = await prismaClient.recipient.findUnique({
      where: {
        id: recId,
      },
    });

    if (recInfo === null) {
      throw new HttpException(404, 'Recipient not found.');
    }

    // Then, proceed with queries
    const [donationsByMonth, topDonators]: [DonationsByMonth, TopDonators] = [
      // Note: Prisma's groupBy function is broken.
      // Donations received across time (grouped by month)
      await prismaClient.$queryRaw<DonationsByMonth>(
        Prisma.sql`
          SELECT
            DATE_TRUNC('month',date) AS month_start_date,
            SUM(amount)::float AS amount_donated
          FROM donation
          WHERE rec_id = ${recId}
          GROUP BY DATE_TRUNC('month',date)
          ORDER BY month_start_date;`,
      ),
      // Top organizations donating to recipient
      await prismaClient.$queryRaw<TopDonators>(
        Prisma.sql`
          SELECT o.name,
            Sum(amount) :: FLOAT AS total_amount
          FROM   donation AS d
            JOIN organization AS o
              ON d.org_id = o.id
          WHERE  rec_id = ${recId}
          GROUP  BY o.id
          ORDER  BY Sum(amount) DESC
          LIMIT  ${10};`,
      ),
    ];

    return { recInfo, donationsByMonth, topDonators };
  }
}

export default RecipientService;
