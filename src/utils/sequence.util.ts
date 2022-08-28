import { Sequence } from '../models/sequence.model';

const getNextValue = async (
  email: string,
  sequencename: string,
): Promise<number> => {
  if (!sequencename) {
    return -1;
  }
  const sequence = await Sequence.findOne({ email, sequencename });
  if (!sequence) {
    return -1;
  }
  const nextValue = sequence.sequencevalue + 1;
  sequence.sequencevalue = nextValue;
  await sequence.save();
  return nextValue;
};

export default getNextValue;
