import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, enum: ['Lost', 'Found'], required: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  location: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Lost', 'Found', 'Returned'], default: undefined },
  imageUrl: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  contactName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, default: '' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

reportSchema.pre('validate', function setDefaultStatus() {
  if (!this.status) this.status = this.type;
});
reportSchema.index({ title: 'text', description: 'text', location: 'text' });

export default mongoose.model('Report', reportSchema);
