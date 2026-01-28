import nodemailer from "nodemailer";

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}) {
  // provider contains server config passed from NextAuth options
  const { server, from } = provider;

  const transporter = nodemailer.createTransport(server);

  const message = {
    to: email,
    from,
    subject: "Seu link mágico de login",
    text: `Use este link para entrar: ${url}`,
    html: `<p>Use este link para entrar:</p><p><a href="${url}">${url}</a></p>`,
  };

  await transporter.sendMail(message);
}
// Função para enviar notificação de novo pedido para a loja
export async function sendOrderNotificationToStore({
  storeEmail,
  storeName,
  order,
  customerName,
}) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>`,
    )
    .join("");

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">🛍️ Novo Pedido Recebido!</h2>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0; color: #1f2937;">Detalhes do Pedido</h3>
        <p><strong>Número:</strong> #${order.id.slice(-8).toUpperCase()}</p>
        <p><strong>Cliente:</strong> ${customerName}</p>
        <p><strong>Telefone:</strong> ${order.customerPhone || "Não informado"}</p>
        <p><strong>Data:</strong> ${new Date(order.createdAt).toLocaleString("pt-BR")}</p>
        <p><strong>Pagamento:</strong> ${order.paymentMethod === "pix" ? "PIX" : order.paymentMethod === "cash" ? "Dinheiro" : order.paymentMethod}</p>
        ${order.needsChange ? `<p><strong>Troco para:</strong> ${formatPrice(order.changeAmount)}</p>` : ""}
        <p><strong>Tipo de Entrega:</strong> ${order.deliveryType === "pickup" ? "🏪 Retirada na Loja" : "🚚 Entrega em Domicílio"}</p>
        ${
          order.deliveryType === "delivery" && order.deliveryAddress
            ? `
        <p><strong>Endereço de Entrega:</strong></p>
        <p style="margin-left: 20px; margin-top: 5px;">
          ${order.deliveryAddress.street}, ${order.deliveryAddress.number}${order.deliveryAddress.complement ? ` - ${order.deliveryAddress.complement}` : ""}<br>
          ${order.deliveryAddress.neighborhood}<br>
          ${order.deliveryAddress.city}, ${order.deliveryAddress.state}<br>
          ${order.deliveryAddress.zipCode ? `CEP: ${order.deliveryAddress.zipCode}<br>` : ""}
          ${order.deliveryAddress.reference ? `Referência: ${order.deliveryAddress.reference}` : ""}
        </p>
        `
            : ""
        }
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #1f2937;">Itens do Pedido</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #d1d5db;">Produto</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #d1d5db;">Qtd</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #d1d5db;">Valor Unit.</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #d1d5db;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Subtotal:</span>
          <strong>${formatPrice(order.subtotal)}</strong>
        </div>
        ${
          order.deliveryFee > 0
            ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Taxa de entrega:</span>
          <strong>${formatPrice(order.deliveryFee)}</strong>
        </div>`
            : ""
        }
        <div style="display: flex; justify-content: space-between; font-size: 18px; color: #059669; border-top: 2px solid #10b981; padding-top: 10px;">
          <span><strong>TOTAL:</strong></span>
          <strong>${formatPrice(order.total)}</strong>
        </div>
      </div>

      <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #92400e;">⚡ Ação Necessária</h3>
        <p style="margin: 0; color: #92400e;">Acesse sua loja para confirmar e preparar este pedido.</p>
      </div>

      <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Este é um email automático do sistema de delivery.</p>
        <p>Para dúvidas, entre em contato com o suporte.</p>
      </div>
    </div>
  `;

  const textContent = `
    Novo Pedido Recebido - ${storeName}
    
    Número do Pedido: #${order.id.slice(-8).toUpperCase()}
    Cliente: ${customerName}
    Telefone: ${order.customerPhone || "Não informado"}
    Data: ${new Date(order.createdAt).toLocaleString("pt-BR")}
    Pagamento: ${order.paymentMethod === "pix" ? "PIX" : order.paymentMethod === "cash" ? "Dinheiro" : order.paymentMethod}
    ${order.needsChange ? `Troco para: ${formatPrice(order.changeAmount)}\n` : ""}
    Tipo de Entrega: ${order.deliveryType === "pickup" ? "Retirada na Loja" : "Entrega em Domicílio"}
    ${
      order.deliveryType === "delivery" && order.deliveryAddress
        ? `
    Endereço de Entrega:
    ${order.deliveryAddress.street}, ${order.deliveryAddress.number}${order.deliveryAddress.complement ? ` - ${order.deliveryAddress.complement}` : ""}
    ${order.deliveryAddress.neighborhood}
    ${order.deliveryAddress.city}, ${order.deliveryAddress.state}
    ${order.deliveryAddress.zipCode ? `CEP: ${order.deliveryAddress.zipCode}` : ""}
    ${order.deliveryAddress.reference ? `Referência: ${order.deliveryAddress.reference}` : ""}
    `
        : ""
    }
    
    Itens do Pedido:
    ${order.items.map((item) => `- ${item.productName} (${item.quantity}x) - ${formatPrice(item.price * item.quantity)}`).join("\n    ")}
    
    Subtotal: ${formatPrice(order.subtotal)}
    ${order.deliveryFee > 0 ? `Taxa de entrega: ${formatPrice(order.deliveryFee)}\n    ` : ""}TOTAL: ${formatPrice(order.total)}
    
    Acesse sua loja para confirmar e preparar este pedido.
  `;

  const message = {
    to: storeEmail,
    from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
    subject: `🛍️ Novo Pedido - ${storeName} (#${order.id.slice(-8).toUpperCase()})`,
    text: textContent,
    html: htmlContent,
  };

  await transporter.sendMail(message);
}
