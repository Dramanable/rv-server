/**
 * 🔄 Result Pattern Implementation
 *
 * Pattern pour la gestion des erreurs de manière fonctionnelle
 * Évite les exceptions et fournit un moyen explicit de gérer succès/échec
 */

export abstract class Result<T, E> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly value?: T;
  public readonly error?: E;

  protected constructor(isSuccess: boolean, error?: E, value?: T) {
    if (isSuccess && error) {
      throw new Error(
        "InvalidOperation: A result cannot be successful and contain an error",
      );
    }
    if (!isSuccess && !error) {
      throw new Error(
        "InvalidOperation: A failing result needs to contain an error message",
      );
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.value = value;
    this.error = error;

    Object.freeze(this);
  }

  public static success<U, F>(value: U): Result<U, F> {
    return new Success<U, F>(value);
  }

  public static failure<U, F>(error: F): Result<U, F> {
    return new Failure<U, F>(error);
  }
}

export class Success<T, E> extends Result<T, E> {
  constructor(value: T) {
    super(true, undefined, value);
  }
}

export class Failure<T, E> extends Result<T, E> {
  constructor(error: E) {
    super(false, error);
  }
}
