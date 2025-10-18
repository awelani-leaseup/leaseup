import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface VerificationEmailProps {
  userName: string;
  verificationUrl: string;
  expirationTime?: string;
}

export default function VerificationEmail({
  userName,
  verificationUrl,
  expirationTime = '24 hours',
}: VerificationEmailProps) {
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
                color: '#2c3e50',
                fontSize: '24px',
                lineHeight: '38px',
                fontWeight: '600',
              }}
            >
              <strong>Verify Your Email Address</strong>
            </Heading>

            <Text
              style={{
                fontSize: '15px',
                lineHeight: '26.25px',
                margin: '0 0 20px 0',
                color: '#374151',
              }}
            >
              Hi {userName}
            </Text>

            <Text
              style={{
                fontSize: '15px',
                lineHeight: '26.25px',
                margin: '0 0 20px 0',
                color: '#374151',
              }}
            >
              Welcome to LeaseUp! To complete your account setup and start using
              our platform, please verify your email address by clicking the
              button below.
            </Text>

            <Text
              style={{
                fontSize: '15px',
                lineHeight: '26.25px',
                margin: '0 0 20px 0',
                color: '#374151',
              }}
            >
              This verification link will expire in {expirationTime}. If you
              didn't create an account with LeaseUp, you can safely ignore this
              email.
            </Text>

            <Section style={{ marginTop: '20px', marginBottom: '20px' }}>
              <Button
                href={verificationUrl}
                style={{
                  backgroundColor: '#2c3e50',
                  borderColor: '#2c3e50',
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
                Verify Email Address
              </Button>
            </Section>

            <Text
              style={{
                fontSize: '15px',
                lineHeight: '26.25px',
                margin: '0 0 20px 0',
                color: '#6b7280',
              }}
            >
              If the button above doesn't work, you can also copy and paste the
              following link into your browser:
            </Text>

            <Text
              style={{
                fontSize: '14px',
                lineHeight: '24px',
                margin: '0 0 20px 0',
                color: '#1e3a8a',
                wordBreak: 'break-all',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
              }}
            >
              {verificationUrl}
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
