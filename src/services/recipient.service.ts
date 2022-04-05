import {
  DonationsByMonth,
  Recipient,
  TopDonators,
  IdeologyDistribution,
  TopDonationsDollarsByIndustry,
  TopDonationsDollarsByCorporation,
  TopDonationsDollarsByUniversity,
  TimeInCongress,
  Leadership,
  Committee,
  SchoolInfo,
} from '@interfaces/recipient.interface';
import { HttpException } from '@exceptions/HttpException';
import { Prisma } from '@prisma/client';
import prismaClient from '@databases/postgresClient';

class RecipientService {
  public async getRecipientData(recId: string, startDate: string, endDate: string): Promise<any> {
    // First check if rec exists (fetch recinfo such as name, industry)
    const recInfo: Recipient = await prismaClient.recipient.findUnique({
      where: {
        id: recId,
      },
    });

    if (recInfo === null) {
      throw new HttpException(404, 'Recipient not found.');
    }

    // Setup date objects to be used for query (start/end date for the requested period)
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const currDateObj = new Date();

    // Then, proceed with queries
    const [
      donationsByMonth,
      topDonators,
      ideologyDistribution,
      topDonationsDollarsByIndustry,
      topDonationsDollarsByCorporation,
      topDonationsDollarsByUniversity,
      timeInCongress,
      leadership,
      committee,
      schoolInfo,
    ]: [
      DonationsByMonth,
      TopDonators,
      IdeologyDistribution,
      TopDonationsDollarsByIndustry,
      TopDonationsDollarsByCorporation,
      TopDonationsDollarsByUniversity,
      TimeInCongress,
      Leadership,
      Committee,
      SchoolInfo,
    ] = [
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
      // Get a distribution of a periods active politician's ideologies
      await prismaClient.$queryRaw<IdeologyDistribution>(
        Prisma.sql`
          SELECT
            CAST(ROUND(r.ideology, 2) as decimal(10,2)) as ideology,
            COUNT(r.ideology) as count
          FROM recipient AS r
            JOIN office AS o
              ON r.id = o.rec_id
          WHERE r.id != ${recId} AND o.start_date <= ${startDateObj} AND o.end_date >= ${endDateObj} AND r.ideology IS NOT NULL
          GROUP BY CAST(ROUND(r.ideology, 2) as decimal(10,2))
          ORDER BY ideology ASC;`,
      ),
      // Get the top 5 industries that donate to this politician in this period
      await prismaClient.$queryRaw<TopDonationsDollarsByIndustry>(
        Prisma.sql`
          SELECT
            SUM(d.amount) as dollars_donated,
            o.industry as industry
          FROM donation AS d
            JOIN organization AS o
              ON d.org_id = o.id
          WHERE d.rec_id = ${recId} AND o.industry != 'school' AND o.industry != 'School' AND d.date BETWEEN ${startDateObj} AND ${endDateObj}
          GROUP BY industry
          ORDER BY dollars_donated DESC
          LIMIT ${5};`,
      ),
      // Get the top 5 corporations that donate to this politician in this period
      await prismaClient.$queryRaw<TopDonationsDollarsByCorporation>(
        Prisma.sql`
          SELECT
            SUM(d.amount) as dollars_donated,
            o.name as corporation
          FROM donation AS d
            JOIN organization AS o
              ON d.org_id = o.id
          WHERE d.rec_id = ${recId} AND o.industry != 'school' AND o.industry != 'School' AND d.date BETWEEN ${startDateObj} AND ${endDateObj}
          GROUP BY corporation
          ORDER BY dollars_donated DESC
          LIMIT ${5};`,
      ),
      // Get the top 5 universities that donate to this politician in this period
      await prismaClient.$queryRaw<TopDonationsDollarsByUniversity>(
        Prisma.sql`
          SELECT
            SUM(d.amount) as dollars_donated,
            o.name as university
          FROM donation AS d
            JOIN organization AS o
              ON d.org_id = o.id
          WHERE d.rec_id = ${recId} AND (o.industry = 'school' OR o.industry = 'School') AND d.date BETWEEN ${startDateObj} AND ${endDateObj}
          GROUP BY university
          ORDER BY dollars_donated DESC
          LIMIT ${5};`,
      ),
      // Get politician's time in the congress
      await prismaClient.$queryRaw<TimeInCongress>(
        Prisma.sql`
          SELECT
            o.start_date as startDate,
            o.end_date as endDate,
            o.title as position
          FROM office AS o
            JOIN recipient AS r
              ON o.rec_id = r.id
          WHERE o.rec_id = ${recId};`,
      ),
      // Get politician's committee leadership positions
      await prismaClient.$queryRaw<Leadership>(
        Prisma.sql`
          SELECT
            l.start_date as startDate,
            l.end_date as endDate,
            l.title as title
          FROM leadership_role AS l
            JOIN recipient AS r
              ON l.rec_id = r.id
          WHERE l.rec_id = ${recId} AND l.start_date <= ${currDateObj} AND (l.end_date IS NULL OR l.end_date >= ${currDateObj});`,
      ),
      // Get politician's committee membership
      await prismaClient.$queryRaw<Committee>(
        Prisma.sql`
          SELECT
            c.name as name,
            m.rank as rank
          FROM committee AS c
            JOIN committee_membership AS m
              ON c.id = m.comm_id
            JOIN recipient AS r
              ON m.rec_id = r.id
          WHERE r.id = ${recId};`,
      ),
      // Get politician's committee membership
      await prismaClient.$queryRaw<SchoolInfo>(
        Prisma.sql`
          SELECT
            o.name as name,
            o.uni_rank as rank
          FROM organization AS o
            JOIN recipient AS r
              ON o.id = r.school
          WHERE r.id = ${recId};`,
      ),
    ];

    return {
      recInfo,
      donationsByMonth,
      topDonators,
      ideologyDistribution,
      topDonationsDollarsByIndustry,
      topDonationsDollarsByCorporation,
      topDonationsDollarsByUniversity,
      timeInCongress,
      leadership,
      committee,
      schoolInfo,
    };
  }

  public async getRecipientList(states: string | null, sortField: string | null, order: string | null): Promise<any> {
    // Form the query object
    const query: any = {
      take: 20,
      where: {},
      select: {
        id: true,
        name: true,
        state: true,
      },
    };

    // Add states to the query
    if (states) {
      const statesArr = states.split(',');
      if (!query.where.OR) {
        query.where.OR = [];
      }
      for (const state of statesArr) {
        query.where.OR.push({ state: state });
      }
    }

    // Add sorting to the query
    if (sortField) {
      if (!query.where.orderBy) {
        query.orderBy = [];
      }
      query.orderBy.push({ [sortField]: order === 'asc' ? 'asc' : 'desc' });
    }

    const recipients: Recipient[] = await prismaClient.recipient.findMany(query);
    return { recipients };
  }
}

export default RecipientService;
