import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface TenantOverdueInvoicesProps {
  landlordName: string;
  invoices: { amount: string; tenantName: string; daysOverdue: string }[];
  ctaUrl: string;
  overdueDate: string;
}

export default function TenantOverdueInvoices({
  landlordName,
  invoices,
  ctaUrl,
  overdueDate,
}: TenantOverdueInvoicesProps) {
  return (
    <Html dir='ltr' lang='en'>
      <Head>
        <Font
          fontFamily='Inter'
          fallbackFontFamily='sans-serif'
          webFont={{
            url: 'https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle='normal'
        />
        <style>{`
          * {
            font-family: 'Inter', sans-serif;
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
                color: '#dc2626',
                fontSize: '24px',
                lineHeight: '38px',
                fontWeight: '600',
              }}
            >
              <strong>Overdue Invoices Alert</strong>
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
              This is an alert to notify you that the following invoices are now
              overdue as of {overdueDate}. You may want to follow up with these
              tenants regarding their outstanding payments.
            </Text>

            <Row style={{ width: '100%', marginBottom: '8px' }}>
              <Column style={{ width: '50%', paddingRight: '4px' }}>
                <Text
                  style={{
                    fontSize: '15px',
                    lineHeight: '26.25px',
                    margin: '0',
                    color: '#374151',
                    fontWeight: 'bold',
                  }}
                >
                  Name
                </Text>
              </Column>
              <Column style={{ width: '50%', paddingLeft: '4px' }}>
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
                  Amount
                </Text>
              </Column>
            </Row>

            {invoices.map((invoice, index) => (
              <Row key={index} style={{ width: '100%', marginBottom: '8px' }}>
                <Column style={{ width: '50%', paddingRight: '4px' }}>
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
                <Column style={{ width: '50%', paddingLeft: '4px' }}>
                  <Text
                    style={{
                      fontSize: '15px',
                      lineHeight: '26.25px',
                      margin: '0',
                      color: '#374151',
                      textAlign: 'right',
                    }}
                  >
                    {invoice.amount}
                  </Text>
                </Column>
              </Row>
            ))}

            <Section style={{ marginTop: '20px', marginBottom: '20px' }}>
              <Button
                href={ctaUrl}
                style={{
                  backgroundColor: '#dc2626',
                  borderColor: '#dc2626',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 24px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                View Overdue Invoices
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
              This report includes overdue invoices for up to 50 tenants. To
              view more detailed invoice information, please log in to your
              account and navigate to the invoices section.
            </Text>

            <Text
              style={{
                fontSize: '15px',
                lineHeight: '26.25px',
                margin: '0',
                color: '#374151',
              }}
            >
              Best Regards
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
