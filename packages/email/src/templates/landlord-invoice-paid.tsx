import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface LandlordInvoicePaidProps {
  landlordName: string;
  paidInvoices: { amount: string; tenantName: string; datePaid: string }[];
  ctaUrl: string;
  reportDate: string;
  totalAmount: string;
}

export default function LandlordInvoicePaid({
  landlordName,
  paidInvoices,
  ctaUrl,
  reportDate,
  totalAmount,
}: LandlordInvoicePaidProps) {
  return (
    <Html dir='ltr' lang='en'>
      <Head>
        <style>{`
          * {
            font-family: Helvetica, Arial, sans-serif;
          }
          blockquote,h1,h2,h3,img,li,ol,p,ul{margin-top:0;margin-bottom:0}
          @media only screen and (max-width:425px){
            .tab-row-full{width:100%!important}
            .tab-col-full{display:block!important;width:100%!important}
            .tab-pad{padding:0!important}
          }
        `}</style>
      </Head>
      <Body style={{ margin: 0 }}>
        <Container
          style={{
            maxWidth: '600px',
            minWidth: '300px',
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '0.5rem',
          }}
        >
          <Section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              padding: '32px',
            }}
          >
            <Heading
              style={{
                margin: '0 0 12px 0',
                textAlign: 'left',
                color: '#16a34a',
                fontSize: '24px',
                lineHeight: '38px',
                fontWeight: '600',
              }}
            >
              <strong>Invoices Paid Today</strong>
            </Heading>

            <Text
              style={{
                fontSize: '15px',
                lineHeight: '26.25px',
                margin: '0 0 20px 0',
                color: '#374151',
              }}
            >
              Hi {landlordName}
            </Text>

            <Text
              style={{
                fontSize: '15px',
                lineHeight: '26.25px',
                margin: '0 0 20px 0',
                color: '#374151',
              }}
            >
              Great news! The following tenants have paid their invoices on{' '}
              {reportDate}. Total amount received:{' '}
              <strong>{totalAmount}</strong>
            </Text>

            {/* Header Row */}
            <Row style={{ width: '100%', marginBottom: '8px' }}>
              <Column style={{ width: '40%', paddingRight: '4px' }}>
                <Text
                  style={{
                    fontSize: '15px',
                    lineHeight: '26.25px',
                    margin: '0',
                    color: '#374151',
                    fontWeight: 'bold',
                  }}
                >
                  Tenant Name
                </Text>
              </Column>
              <Column
                style={{
                  width: '30%',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                }}
              >
                <Text
                  style={{
                    fontSize: '15px',
                    lineHeight: '26.25px',
                    margin: '0',
                    color: '#374151',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  Amount Paid
                </Text>
              </Column>
              <Column style={{ width: '30%', paddingLeft: '4px' }}>
                <Text
                  style={{
                    fontSize: '15px',
                    lineHeight: '26.25px',
                    margin: '0',
                    color: '#374151',
                    fontWeight: 'bold',
                    textAlign: 'right',
                  }}
                >
                  Date Paid
                </Text>
              </Column>
            </Row>

            {/* Paid Invoice Rows */}
            {paidInvoices.map((invoice, index) => (
              <Row key={index} style={{ width: '100%', marginBottom: '8px' }}>
                <Column style={{ width: '40%', paddingRight: '4px' }}>
                  <Text
                    style={{
                      fontSize: '15px',
                      lineHeight: '26.25px',
                      margin: '0',
                      color: '#374151',
                    }}
                  >
                    {invoice.tenantName}
                  </Text>
                </Column>
                <Column
                  style={{
                    width: '30%',
                    paddingLeft: '4px',
                    paddingRight: '4px',
                  }}
                >
                  <Text
                    style={{
                      fontSize: '15px',
                      lineHeight: '26.25px',
                      margin: '0',
                      color: '#16a34a',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    {invoice.amount}
                  </Text>
                </Column>
                <Column style={{ width: '30%', paddingLeft: '4px' }}>
                  <Text
                    style={{
                      fontSize: '15px',
                      lineHeight: '26.25px',
                      margin: '0',
                      color: '#374151',
                      textAlign: 'right',
                    }}
                  >
                    {invoice.datePaid}
                  </Text>
                </Column>
              </Row>
            ))}

            {/* Total Summary Section */}
            <Section
              style={{
                marginTop: '24px',
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
              }}
            >
              <Row style={{ width: '100%' }}>
                <Column style={{ width: '70%' }}>
                  <Text
                    style={{
                      fontSize: '16px',
                      lineHeight: '26.25px',
                      margin: '0',
                      color: '#374151',
                      fontWeight: 'bold',
                    }}
                  >
                    Total Received:
                  </Text>
                </Column>
                <Column style={{ width: '30%' }}>
                  <Text
                    style={{
                      fontSize: '16px',
                      lineHeight: '26.25px',
                      margin: '0',
                      color: '#16a34a',
                      fontWeight: 'bold',
                      textAlign: 'right',
                    }}
                  >
                    {totalAmount}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section style={{ marginTop: '20px', marginBottom: '20px' }}>
              <Button
                href={ctaUrl}
                style={{
                  backgroundColor: '#16a34a',
                  borderColor: '#16a34a',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '12px 32px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                View All Invoices
              </Button>
            </Section>

            <Text
              style={{
                fontSize: '15px',
                lineHeight: '26.25px',
                margin: '0 0 20px 0',
                color: '#000000',
              }}
            >
              This daily report includes paid invoices for up to 50 tenants. To
              view more detailed payment information and manage your invoices,
              please log in to your account and navigate to the invoices
              section.
            </Text>

            <Text
              style={{
                fontSize: '15px',
                lineHeight: '26.25px',
                margin: '0',
                color: '#374151',
              }}
            >
              Best Regards,
              <br />
              The LeaseUp Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
