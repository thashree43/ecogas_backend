import { Types } from "mongoose";
import { IUserRepository } from "../domain";
import { IOrderData } from "../infrastructure/database";
import { Emailservice } from "../infrastructure/service/emailservice";

interface CustomerDetails {
  name: string;
  consumerId: string;
  mobile: string;
  address: string;
}

interface SelectedGas {
  _id: string;
  companyname: string;
  weight: number;
  price: number;
}

export class orderplaceusecase {

  private emailService:Emailservice
  constructor(private UserRepositories: IUserRepository) {
    this.emailService = new Emailservice()
  }

  async execute(
    userId: string,
    selectedProviderId: string,
    customerDetails: CustomerDetails,
    paymentMethod: string,
    selectedGas: SelectedGas
  ): Promise<{ success: boolean; order: IOrderData }> {
    let statuschange;
    if (paymentMethod === "UPI") {
      statuschange = "placed";
    } else {
      statuschange = "placed";
    }

    const orderData: Partial<IOrderData> = {
      name: customerDetails.name,
      address: customerDetails.address,
      mobile: parseInt(customerDetails.mobile),
      consumerid: parseInt(customerDetails.consumerId),
      company: selectedGas.companyname,
      price: selectedGas.price,
      paymentmethod: paymentMethod,
      expectedat: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 
      status: statuschange,
      emailNotificationSent: false,
      reminderSent: false
    };

    const selectedgasId = selectedGas._id;
    const order = await this.UserRepositories.createOrder(selectedgasId, orderData);
    const orderId = order._id;
    await this.UserRepositories.linkOrderToUser(userId, orderId);
    await this.UserRepositories.linkOrderToProvider(selectedProviderId, orderId);


    const user = await this.UserRepositories.getbyId(userId);
    if (user && user.email) {
      // Send immediate confirmation
      await this.emailService.sendOrderConfirmation(user.email, {
        orderId: orderId.toString(),
        name: customerDetails.name,
        company: selectedGas.companyname,
        expectedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        price: selectedGas.price
      });
      await this.UserRepositories.updateOrder(orderId, {
        emailNotificationSent: true
      });
    }
    // Return a success object
    return { success: true, order };
  }
}
