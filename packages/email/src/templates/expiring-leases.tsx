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

interface ExpiringLeasesProps {
  landlordName: string;
  leases: { tenantName: string; expiryDate: string }[];
  ctaUrl: string;
  alertDate: string;
}

export function ExpiringLeases({
  landlordName,
  leases,
  ctaUrl,
  alertDate,
}: ExpiringLeasesProps) {
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
                color: '#f59e0b',
                fontSize: '24px',
                lineHeight: '38px',
                fontWeight: '600',
              }}
            >
              <strong>Lease Expiration Alert</strong>
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
              This is an alert to notify you that the following leases are
              expiring soon as of {alertDate}. You may want to reach out to
              these tenants regarding lease renewals or move-out procedures.
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
                  Tenant Name
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
                  Expiry Date
                </Text>
              </Column>
            </Row>

            {leases.map((lease, index) => (
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
                    {lease.tenantName}
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
                    {lease.expiryDate}
                  </Text>
                </Column>
              </Row>
            ))}

            <Section style={{ marginTop: '20px', marginBottom: '20px' }}>
              <Button
                href={ctaUrl}
                style={{
                  backgroundColor: '#f59e0b',
                  borderColor: '#f59e0b',
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
                View Expiring Leases
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
              This report includes expiring leases for up to 50 tenants. To view
              more detailed lease information, please log in to your account and
              navigate to the leases section.
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
