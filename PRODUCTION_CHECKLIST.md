# 🚀 Production Deployment Checklist

Use this checklist when you're ready to accept real payments.

---

## Before You Start

- [ ] You've tested the payment flow thoroughly in test mode
- [ ] You've successfully completed multiple test transactions
- [ ] All features are working as expected
- [ ] You have a backup of your code and database

---

## Stripe Account Setup

### 1. Complete Business Profile
- [ ] Add business details (name, description, website)
- [ ] Add business address
- [ ] Add business type and structure
- [ ] Upload any required business documents

### 2. Verify Identity
- [ ] Complete identity verification (required by Stripe)
- [ ] Provide government-issued ID
- [ ] Complete any additional verification steps

### 3. Add Banking Information
- [ ] Add bank account for receiving payouts
- [ ] Verify bank account (Stripe will send test deposits)
- [ ] Set payout schedule (daily, weekly, monthly)

### 4. Review Terms & Policies
- [ ] Accept Stripe's Terms of Service
- [ ] Review and accept Connected Account Agreement (if applicable)
- [ ] Review payment processing fees

---

## Technical Setup

### 1. Switch to Live Mode

**In Stripe Dashboard:**
- [ ] Toggle from "Test Mode" to "Live Mode" (top right)
- [ ] Go to Developers → API keys
- [ ] Copy your **live** keys:
  - Publishable key (starts with `pk_live_`)
  - Secret key (starts with `sk_live_`)

**In Your Backend:**
- [ ] Update `backend/.env` with live keys:
  ```env
  STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
  STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
  ```
- [ ] **IMPORTANT**: Never commit `.env` to git!

### 2. Set Up Webhooks

**Why?** Get real-time payment notifications (more reliable than redirects)

- [ ] In Stripe Dashboard → Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] Add your webhook URL: `https://yourdomain.com/api/payments/webhook`
- [ ] Select events to listen for:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
- [ ] Copy the webhook signing secret (starts with `whsec_`)
- [ ] Add to `backend/.env`:
  ```env
  STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
  ```

### 3. Update URLs

**In `backend/.env`:**
- [ ] Update success URL:
  ```env
  STRIPE_SUCCESS_URL=https://yourdomain.com/certification/result
  ```
- [ ] Update cancel URL:
  ```env
  STRIPE_CANCEL_URL=https://yourdomain.com/certification
  ```

### 4. SSL/HTTPS Setup
- [ ] Ensure your website has SSL certificate (HTTPS)
- [ ] Test HTTPS is working correctly
- [ ] Verify SSL certificate is valid and not expired
- [ ] **Required**: Stripe requires HTTPS in production

---

## Testing in Production

### 1. Small Test Transaction
- [ ] Make a test purchase with a real card (small amount)
- [ ] Use your own card to test
- [ ] Verify payment completes successfully
- [ ] Check that payment status updates in database
- [ ] Verify webhook is triggered (check Stripe Dashboard)
- [ ] Test the full user flow from start to finish

### 2. Refund Test (Optional)
- [ ] Issue a refund from Stripe Dashboard
- [ ] Verify refund processes correctly
- [ ] Test refund handling in your application

---

## Legal & Compliance

### 1. Website Requirements
- [ ] Add Privacy Policy (mention payment processing)
- [ ] Add Terms of Service
- [ ] Add Refund Policy
- [ ] Add Contact Information
- [ ] Include business registration details (if applicable)

### 2. Payment Page
- [ ] Display total price clearly
- [ ] Show currency
- [ ] Display any taxes or fees
- [ ] Show "Powered by Stripe" (recommended)
- [ ] Include secure payment indicators

### 3. Compliance
- [ ] Ensure compliance with local regulations
- [ ] Check if you need to collect sales tax
- [ ] Verify you're compliant with GDPR (if serving EU)
- [ ] Check PCI DSS compliance (Stripe handles most of this)

---

## Email & Customer Communication

### 1. Receipts
- [ ] Stripe sends automatic receipts (verify this is enabled)
- [ ] Test receipt emails are delivered
- [ ] Customize receipt email in Stripe Dashboard (optional)

### 2. Certificate Delivery
- [ ] Implement certificate PDF generation
- [ ] Set up automated email delivery
- [ ] Test certificate emails are sent after payment
- [ ] Include certificate in email attachment
- [ ] Add backup download link

### 3. Customer Support
- [ ] Set up support email address
- [ ] Create FAQ page for payment questions
- [ ] Document refund process
- [ ] Prepare responses for common issues

---

## Monitoring & Analytics

### 1. Stripe Dashboard
- [ ] Set up email notifications for:
  - Successful payments
  - Failed payments
  - Disputes/chargebacks
  - Unusual activity
- [ ] Review daily payment reports
- [ ] Monitor failed payment reasons

### 2. Your Application
- [ ] Set up error logging
- [ ] Monitor webhook delivery
- [ ] Track conversion rates
- [ ] Monitor payment success/failure rates
- [ ] Set up alerts for payment failures

### 3. Financial Tracking
- [ ] Track gross revenue
- [ ] Calculate net revenue (after Stripe fees)
- [ ] Monitor refund rates
- [ ] Track customer acquisition cost

---

## Security

### 1. Code Review
- [ ] Review all payment-related code
- [ ] Ensure no Stripe keys are hardcoded
- [ ] Verify `.env` is in `.gitignore`
- [ ] Check webhook signature verification is enabled
- [ ] Ensure payment verification happens server-side

### 2. Access Control
- [ ] Limit who has access to Stripe Dashboard
- [ ] Enable two-factor authentication on Stripe account
- [ ] Use strong passwords
- [ ] Don't share API keys via email/chat

### 3. Regular Updates
- [ ] Keep Stripe SDK updated
- [ ] Monitor Stripe changelog for breaking changes
- [ ] Update dependencies regularly
- [ ] Test after updates

---

## Launch Day

### Final Checks
- [ ] All test transactions completed successfully
- [ ] Webhooks are working
- [ ] Certificate delivery is automated
- [ ] Customer support is ready
- [ ] Backup plan in place if issues occur
- [ ] Monitoring is set up and working

### Go Live
- [ ] Switch environment to production
- [ ] Restart backend server
- [ ] Verify live keys are being used
- [ ] Make first live transaction
- [ ] Monitor for any errors
- [ ] Check Stripe Dashboard for successful payment

### Post-Launch
- [ ] Monitor for first 24 hours closely
- [ ] Check webhook deliveries
- [ ] Review any failed payments
- [ ] Respond to customer inquiries quickly
- [ ] Track conversion rates
- [ ] Gather customer feedback

---

## Troubleshooting Common Issues

### Payment Fails
- Check Stripe Dashboard for error details
- Verify webhook is receiving events
- Check server logs for errors
- Ensure SSL is working properly

### Webhook Not Received
- Verify webhook URL is correct
- Check webhook signing secret
- Test webhook manually in Stripe Dashboard
- Check server logs for incoming requests

### Certificate Not Delivered
- Check email sending service
- Verify email templates are correct
- Check spam folders
- Monitor email delivery rates

---

## Support Resources

### Stripe Resources
- **Dashboard**: https://dashboard.stripe.com
- **Documentation**: https://stripe.com/docs
- **Support**: https://support.stripe.com
- **Status Page**: https://status.stripe.com

### Your Documentation
- `STRIPE_SETUP_GUIDE.md` - Setup instructions
- `backend/API_DOCS.md` - API reference
- `backend/modules/payments/README.md` - Technical docs

---

## Emergency Contacts

**If Something Goes Wrong:**

1. **Disable Payments** (Emergency Only):
   - Set `STRIPE_SECRET_KEY=` (empty) in `.env`
   - Restart server
   - This will prevent new payments

2. **Contact Stripe Support**:
   - Email: support@stripe.com
   - Dashboard: Help button in bottom right

3. **Check Status**:
   - https://status.stripe.com
   - Check if Stripe has any outages

---

## Success Criteria

You're ready for production when:

✅ All checklist items are complete
✅ Multiple test transactions successful
✅ Webhooks working reliably
✅ Certificate delivery automated
✅ SSL/HTTPS enabled
✅ Legal pages in place
✅ Customer support ready
✅ Monitoring in place

---

## 🎉 Congratulations!

Once you've completed this checklist, you're ready to accept real payments!

**Remember:**
- Start with low-volume testing
- Monitor closely for first few days
- Respond quickly to any issues
- Scale up as you gain confidence

**Good luck with your launch! 🚀**
