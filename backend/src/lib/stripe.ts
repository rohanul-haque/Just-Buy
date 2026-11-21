import config from "@/config";
import Stripe from "stripe";

const stripe = new Stripe(config.STRIPE_SECRET_KEY!);

export default stripe;
