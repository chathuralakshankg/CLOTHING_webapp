const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');
const Setting = require('../models/Setting');

/**
 * Checks if a variant's stock has fallen below its threshold (default 2)
 * and dispatches in-app notification and email alert.
 * 
 * @param {Object} product - Product document or object
 * @param {Object} variant - Variant object
 * @param {Number|null} previousStock - Stock before reduction
 */
const checkAndNotifyLowStock = async (product, variant, previousStock = null) => {
  try {
    // If product is deactivated or discontinued, do not trigger low stock notifications
    if (product.isActive === false) {
      return;
    }

    const threshold = typeof variant.threshold === 'number' ? variant.threshold : 2;
    const currentStock = Number(variant.stock) || 0;

    // Trigger notification when quantity falls below threshold
    if (currentStock < threshold) {
      const variantDesc = `Size ${variant.size}${variant.color ? ` / Color ${variant.color}` : ''}`;
      const title = `Low Stock Alert: ${product.name}`;
      const message = `${product.name} (${variantDesc}) has fallen below the threshold (${threshold}). Current remaining quantity: ${currentStock}.`;

      // Check if an unread notification for this product & variant already exists
      let existingNotification = await Notification.findOne({
        product: product._id,
        'variant.size': variant.size,
        'variant.color': variant.color || '',
        isRead: false,
      });

      if (existingNotification) {
        existingNotification.message = message;
        existingNotification.variant.stock = currentStock;
        existingNotification.variant.threshold = threshold;
        await existingNotification.save();
      } else {
        await Notification.create({
          type: 'LOW_STOCK',
          title,
          message,
          product: product._id,
          productName: product.name,
          variant: {
            size: variant.size,
            color: variant.color || '',
            stock: currentStock,
            threshold,
          },
          isRead: false,
        });
      }

      console.log(`[LOW STOCK ALERT] ${product.name} (${variantDesc}): Stock=${currentStock}, Threshold=${threshold}`);

      // Attempt to send email alert to admin
      try {
        let recipientEmail = process.env.FROM_EMAIL;
        const setting = await Setting.findOne();
        if (setting && setting.companyEmail) {
          recipientEmail = setting.companyEmail;
        }

        if (recipientEmail) {
          await sendEmail({
            to: recipientEmail,
            subject: `🚨 [Low Stock Alert] ${product.name} (${variantDesc}) - ${currentStock} left!`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
                <div style="border-bottom: 2px solid #b91c1c; padding-bottom: 12px; margin-bottom: 20px;">
                  <span style="font-size: 11px; font-weight: bold; letter-spacing: 0.15em; color: #b91c1c; text-transform: uppercase;">StyleHub Inventory Intelligence</span>
                  <h2 style="margin: 6px 0 0 0; color: #111827; font-size: 20px;">Low Stock Warning</h2>
                </div>

                <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                  Attention: Inventory quantity for the following product variant has fallen below your configured threshold (<strong>${threshold}</strong>).
                </p>

                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Product:</td>
                      <td style="padding: 6px 0; font-weight: bold; color: #111827;">${product.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Variant:</td>
                      <td style="padding: 6px 0; color: #1f2937;">${variantDesc}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Remaining Quantity:</td>
                      <td style="padding: 6px 0; color: #dc2626; font-size: 16px; font-weight: bold;">${currentStock} unit${currentStock === 1 ? '' : 's'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Low-Stock Threshold:</td>
                      <td style="padding: 6px 0; color: #1f2937;">${threshold}</td>
                    </tr>
                  </table>
                </div>

                <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                  Please restock this item soon in the StyleHub Admin Console to prevent stockouts and lost sales.
                </p>
              </div>
            `,
          });
          console.log(`[LOW STOCK EMAIL DISPATCHED] to ${recipientEmail}`);
        }
      } catch (emailErr) {
        console.warn(`[LOW STOCK EMAIL WARNING] Could not dispatch email: ${emailErr.message}`);
      }
    }
  } catch (err) {
    console.error('checkAndNotifyLowStock error:', err);
  }
};

module.exports = {
  checkAndNotifyLowStock,
};
