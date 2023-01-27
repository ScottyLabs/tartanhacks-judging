/*
 * Adapting crowd-bt algorithm for parallel multi-category judging.
 * Based on implementation in Gavel. See:
 * https://github.com/anishathalye/gavel/blob/master/gavel/crowd_bt.py
 */

import betaln from "@stdlib/math-base-special-betaln";
import digamma from "@stdlib/math-base-special-digamma";
import { id, uproduct } from "./fp";

/* See this paper for more information:
 * http://people.stern.nyu.edu/xchen3/images/crowd_pairwise.pdf
 */

const GAMMA = 0.1;
const LAMBDA = 1; // regularization parameter
const KAPPA = 0.0001; // to ensure positivity of variance
const MU_PRIOR = 0;
const SIGMA_SQ_PRIOR = 1;
const ALPHA_PRIOR = 10;
const BETA_PRIOR = 1;
const EPSILON = 0.25;

function argmax<T>(f: (x: T) => number, xs: T[]): T {
  const update = (e1: [number, T], e2: [number, T]) =>
    e2[0] > e1[0] ? e2 : e1;
  return xs.map(uproduct(f, id)).reduce(update)[1];
}

const divergenceGaussian = (
  mu1: number,
  sigmaSq1: number,
  mu2: number,
  sigmaSq2: number
): number => {
  const ratio = sigmaSq1 / sigmaSq2;
  return (mu1 - mu2) ** 2 / (2 * sigmaSq2) + (ratio - 1 - Math.log(ratio)) / 2;
};

const divergenceBeta = (
  alpha1: number,
  beta1: number,
  alpha2: number,
  beta2: number
): number => {
  return (
    betaln(alpha2, beta2) -
    betaln(alpha1, beta1) +
    (alpha1 - alpha2) * digamma(alpha1) +
    (beta1 - beta2) * digamma(beta1) +
    (alpha2 - alpha1 + beta2 - beta1) * digamma(alpha1 + beta1)
  );
};

const update = (
  alpha: number,
  beta: number,
  muWinner: number,
  sigmaSqWinner: number,
  muLoser: number,
  sigmaSqLoser: number
): [number, number, number, number, number, number] => {
  const [updatedAlpha, updatedBeta] = updatedAnnotator(
    alpha,
    beta,
    muWinner,
    sigmaSqWinner,
    muLoser,
    sigmaSqLoser
  );
  const [updatedMuWinner, updatedMuLoser] = updatedMus(
    alpha,
    beta,
    muWinner,
    sigmaSqWinner,
    muLoser,
    sigmaSqLoser
  );
  const [updatedSigmaSqWinner, updatedSigmaSqLoser] = updatedSigmaSqs(
    alpha,
    beta,
    muWinner,
    sigmaSqWinner,
    muLoser,
    sigmaSqLoser
  );
  return [
    updatedAlpha,
    updatedBeta,
    updatedMuWinner,
    updatedSigmaSqWinner,
    updatedMuLoser,
    updatedSigmaSqLoser,
  ];
};

const expectedInformationGain = (
  alpha: number,
  beta: number,
  muA: number,
  sigmaSqA: number,
  muB: number,
  sigmaSqB: number
): number => {
  const [alpha1, beta1, c] = updatedAnnotator(
    alpha,
    beta,
    muA,
    sigmaSqA,
    muB,
    sigmaSqB
  );
  const [muA1, muB1] = updatedMus(alpha, beta, muA, sigmaSqA, muB, sigmaSqB);
  const [sigmaSqA1, sigmaSqB1] = updatedSigmaSqs(
    alpha,
    beta,
    muA,
    sigmaSqA,
    muB,
    sigmaSqB
  );
  const probARankedAbove = c;
  const [alpha2, beta2] = updatedAnnotator(
    alpha,
    beta,
    muB,
    sigmaSqB,
    muA,
    sigmaSqA
  );
  const [muB2, muA2] = updatedMus(alpha, beta, muB, sigmaSqB, muA, sigmaSqA);
  const [sigmaSqB2, sigmaSqA2] = updatedSigmaSqs(
    alpha,
    beta,
    muB,
    sigmaSqB,
    muA,
    sigmaSqA
  );

  return (
    probARankedAbove *
      (divergenceGaussian(muA1, sigmaSqA1, muA, sigmaSqA) +
        divergenceGaussian(muB1, sigmaSqB1, muB, sigmaSqB) +
        GAMMA * divergenceBeta(alpha1, beta1, alpha, beta)) +
    (1 - probARankedAbove) *
      (divergenceGaussian(muA2, sigmaSqA2, muA, sigmaSqA) +
        divergenceGaussian(muB2, sigmaSqB2, muB, sigmaSqB) +
        GAMMA * divergenceBeta(alpha2, beta2, alpha, beta))
  );
};
// returns (updated mu of winner, updated mu of loser)
const updatedMus = (
  alpha: number,
  beta: number,
  muWinner: number,
  sigmaSqWinner: number,
  muLoser: number,
  sigmaSqLoser: number
): [number, number] => {
  const mult =
    (alpha * Math.exp(muWinner)) /
      (alpha * Math.exp(muWinner) + beta * Math.exp(muLoser)) -
    Math.exp(muWinner) / (Math.exp(muWinner) + Math.exp(muLoser));
  const updatedMuWinner = muWinner + sigmaSqWinner * mult;
  const updatedMuLoser = muLoser - sigmaSqLoser * mult;

  return [updatedMuWinner, updatedMuLoser];
};

// returns (updated sigma squared of winner, updated sigma squared of loser)
const updatedSigmaSqs = (
  alpha: number,
  beta: number,
  muWinner: number,
  sigmaSqWinner: number,
  muLoser: number,
  sigmaSqLoser: number
): [number, number] => {
  const mult =
    (alpha * Math.exp(muWinner) * beta * Math.exp(muLoser)) /
      (alpha * Math.exp(muWinner) + beta * Math.exp(muLoser)) ** 2 -
    (Math.exp(muWinner) * Math.exp(muLoser)) /
      (Math.exp(muWinner) + Math.exp(muLoser)) ** 2;

  const updatedSigmaSqWinner =
    sigmaSqWinner * Math.max(1 + sigmaSqWinner * mult, KAPPA);
  const updatedSigmaSqLoser =
    sigmaSqLoser * Math.max(1 + sigmaSqLoser * mult, KAPPA);

  return [updatedSigmaSqWinner, updatedSigmaSqLoser];
};

// returns (updated alpha, updated beta, pr i >k j which is c)
const updatedAnnotator = (
  alpha: number,
  beta: number,
  muWinner: number,
  sigmaSqWinner: number,
  muLoser: number,
  sigmaSqLoser: number
): [number, number, number] => {
  const c_1 =
    Math.exp(muWinner) / (Math.exp(muWinner) + Math.exp(muLoser)) +
    (0.5 *
      (sigmaSqWinner + sigmaSqLoser) *
      (Math.exp(muWinner) *
        Math.exp(muLoser) *
        (Math.exp(muLoser) - Math.exp(muWinner)))) /
      (Math.exp(muWinner) + Math.exp(muLoser)) ** 3;
  const c_2 = 1 - c_1;
  const c = (c_1 * alpha + c_2 * beta) / (alpha + beta);

  const expt =
    (c_1 * (alpha + 1) * alpha + c_2 * alpha * beta) /
    (c * (alpha + beta + 1) * (alpha + beta));
  const expt_sq =
    (c_1 * (alpha + 2) * (alpha + 1) * alpha +
      c_2 * (alpha + 1) * alpha * beta) /
    (c * (alpha + beta + 2) * (alpha + beta + 1) * (alpha + beta));

  const variance = expt_sq - expt ** 2;
  const updatedAlpha = ((expt - expt_sq) * expt) / variance;
  const updatedBeta = ((expt - expt_sq) * (1 - expt)) / variance;

  return [updatedAlpha, updatedBeta, c];
};

export {
  argmax,
  divergenceGaussian,
  divergenceBeta,
  update,
  expectedInformationGain,
  GAMMA,
  LAMBDA,
  MU_PRIOR,
  SIGMA_SQ_PRIOR,
  ALPHA_PRIOR,
  BETA_PRIOR,
  EPSILON,
};
