import React, {useEffect, useState} from 'react'
import './App.css'
import {TwilioComplianceEmbed} from 'twilio-compliance-embed'
import {Spinner} from '@twilio-paste/core/spinner'
import {Box} from '@twilio-paste/core'

type InboundEvent = {
  data: {
    inquiryId: string,
    inquirySessionToken: string
  },
  origin: string
}

type OutboundEvent = 'cancel' | 'complete' | 'ready' | 'error';

export const KycEmbedComponent = () => {

  const [inquiryId, setInquiryId] = useState<string | null>(null)
  const [inquirySessionToken, setInquirySessionToken] = useState<string | null>(null)
  const isLoading = !inquiryId && !inquirySessionToken;

  useEffect(() => {
    const receiveMessage = (event: InboundEvent) => {
      if( event.origin !== 'https://local.ontraport.com' && event.origin !== 'https://app.ontraport.com' ) {
        return;
      }

      if ( !!event.data.inquiryId && !!event.data.inquirySessionToken ) {
        setInquiryId( event.data.inquiryId );
        setInquirySessionToken( event.data.inquirySessionToken );
      }
    }

    window.addEventListener( 'message', receiveMessage, false );

    return () => {
      window.removeEventListener( 'message', receiveMessage );
    }
  }, [])

  const postEvent = (event: OutboundEvent) => {
    // Emit event to both app and local so it works for both
    window.parent.postMessage({
      event: event,
    }, 'https://local.ontraport.com' );

    window.parent.postMessage({
      event: event,
    }, 'https://app.ontraport.com' );
  }

  return isLoading ? (
      <Box top='50%' left='50%' position='fixed'>
        <Spinner size='sizeIcon110' decorative={false} title='Loading'/>
      </Box>
    ) :
    (<div className='App'>
      <TwilioComplianceEmbed
        inquiryId={inquiryId!}
        inquirySessionToken={inquirySessionToken!}
        onCancel={() => {
          postEvent('cancel')
        }}
        onComplete={() => {
          postEvent('complete')
        }}
        onReady={() => {
          postEvent('ready')
        }}
        onError={() => {
          postEvent('error')
        }}
      />
    </div>)
}