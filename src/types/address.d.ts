export default interface Address {
  type: 'Home' | 'Work' | 'Other';
  line1: string;
  line2?: string;
  line3?: string;
}
