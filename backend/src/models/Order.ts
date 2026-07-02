import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;

  items: IOrderItem[];

  shippingAddress: mongoose.Types.ObjectId;

  totalItems: number;
  totalAmount: number;

  paymentMethod:
    | "COD"
    | "ONLINE";

  paymentStatus:
    | "pending"
    | "paid"
    | "failed";

  paymentId?: string;

  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    shippingAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    totalItems: {
      type: Number,
      required: true,
      default: 0,
      min: 1,
    },

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
      ],
      default: "pending",
    },

    paymentId: {
      type: String,
      default: "",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Useful indexes for admin dashboard
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export const Order =
  mongoose.model<IOrder>(
    "Order",
    orderSchema
  );