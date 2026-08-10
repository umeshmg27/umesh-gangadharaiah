import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import emailjs from "@emailjs/browser";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { emailjsConfig } from "../contact/emailjsConfig";
import { sendContactMessage } from "../contact/sendContactMessage";
import ContactForm from "./ContactForm";
import contactFormCss from "./ContactForm.module.css?raw";

const { emailjsSendMock } = vi.hoisted(() => ({
  emailjsSendMock: vi.fn(),
}));

vi.mock("@emailjs/browser", () => ({
  default: {
    send: emailjsSendMock,
  },
}));

type Deferred<T> = {
  promise: Promise<T>;
  reject: (reason?: unknown) => void;
  resolve: (value: T) => void;
};

function createDeferred<T>(): Deferred<T> {
  let reject!: Deferred<T>["reject"];
  let resolve!: Deferred<T>["resolve"];
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

function successfulResponse() {
  return { status: 200, text: "OK" };
}

function renderContactForm() {
  const user = userEvent.setup();
  render(<ContactForm />);

  const section = screen.getByRole("region", { name: "Contact Me" });
  const form = within(section).getByRole("form", { name: "Contact Umesh" });
  const name = within(form).getByRole("textbox", { name: "Your Name" });
  const contact = within(form).getByRole("textbox", { name: "Email / Phone" });
  const message = within(form).getByRole("textbox", { name: "Message" });

  return { contact, form, message, name, section, user };
}

function expectSinglePoliteStatus(
  form: HTMLElement,
  message: string,
): HTMLElement {
  const statuses = within(form).getAllByRole("status");

  expect(statuses).toHaveLength(1);
  expect(statuses[0]).toHaveAttribute("aria-live", "polite");
  expect(statuses[0]).toHaveTextContent(message);
  return statuses[0];
}

async function fillRequiredFields(
  user: ReturnType<typeof userEvent.setup>,
  fields: {
    contact: HTMLElement;
    message: HTMLElement;
    name: HTMLElement;
  },
  values = {
    name: "Ada Lovelace",
    contact: "ada@example.com",
    message: "Let us build something useful.",
  },
): Promise<void> {
  await user.type(fields.name, values.name);
  await user.type(fields.contact, values.contact);
  await user.type(fields.message, values.message);
}

beforeEach(() => {
  emailjsSendMock.mockReset();
  emailjsSendMock.mockResolvedValue(successfulResponse());
});

describe("sendContactMessage", () => {
  it("preserves the legacy public EmailJS identifiers in one configuration", () => {
    expect(emailjsConfig).toEqual({
      serviceId: "service_tnhcvia",
      templateId: "template_8yatare",
      publicKey: "kbbmQWHjbQUFEwFQ4",
    });
  });

  it("maps contact to the existing email field and returns the provider promise", async () => {
    const providerPromise = Promise.resolve(successfulResponse());
    emailjsSendMock.mockReturnValueOnce(providerPromise);
    const payload = {
      name: "Ada Lovelace",
      contact: "+44 20 7946 0958",
      message: "Hello from the portfolio.",
    };

    const result = sendContactMessage(payload);

    expect(result).toBe(providerPromise);
    expect(emailjs.send).toHaveBeenCalledTimes(1);
    expect(emailjs.send).toHaveBeenCalledWith(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      {
        name: payload.name,
        email: payload.contact,
        message: payload.message,
      },
      emailjsConfig.publicKey,
    );
    await result;
  });

  it("does not log the payload, provider response, or provider failure", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const payload = {
      name: "Ada Lovelace",
      contact: "ada@example.com",
      message: "Private message",
    };

    await sendContactMessage(payload);
    const providerFailure = new Error("Provider unavailable");
    emailjsSendMock.mockRejectedValueOnce(providerFailure);
    await expect(sendContactMessage(payload)).rejects.toBe(providerFailure);

    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

describe("ContactForm", () => {
  it("keeps the contact anchor and heading while giving every field a unique label and description", () => {
    render(
      <>
        <ContactForm />
        <ContactForm />
      </>,
    );

    const sections = screen.getAllByRole("region", { name: "Contact Me" });
    const fieldIds: string[] = [];
    const descriptionIds: string[] = [];

    expect(sections).toHaveLength(2);
    expect(sections[0]).toHaveAttribute("id", "contact");
    expect(
      within(sections[0]).getByRole("heading", {
        level: 2,
        name: "Contact Me",
      }),
    ).toBeInTheDocument();
    expect(
      within(sections[0]).getByText(
        "Got a project waiting to be realized? Let's collaborate and make it happen!",
      ),
    ).toBeInTheDocument();

    for (const section of sections) {
      const form = within(section).getByRole("form", { name: "Contact Umesh" });
      expect(form).toHaveAttribute("novalidate");

      for (const name of ["Your Name", "Email / Phone", "Message"]) {
        const field = within(form).getByRole("textbox", { name });
        const describedBy = field.getAttribute("aria-describedby");

        expect(field.id).toBeTruthy();
        expect(describedBy).toBeTruthy();
        expect(document.getElementById(describedBy ?? "")).not.toBeNull();
        expect(field).toBeRequired();
        fieldIds.push(field.id);
        descriptionIds.push(describedBy ?? "");
      }
    }

    expect(new Set(fieldIds).size).toBe(fieldIds.length);
    expect(new Set(descriptionIds).size).toBe(descriptionIds.length);
  });

  it("trims required values, associates every error, and focuses the first invalid field in document order", async () => {
    const { contact, form, message, name, user } = renderContactForm();
    await user.type(name, "   ");
    await user.type(contact, "   ");
    await user.type(message, "   ");
    const focusSnapshots: {
      describedBy: readonly string[];
      errorId: string | null;
      errorText: string | null;
      invalid: string | null;
    }[] = [];
    name.addEventListener("focus", () => {
      const errorId = name.getAttribute("aria-errormessage");

      focusSnapshots.push({
        describedBy: (name.getAttribute("aria-describedby") ?? "").split(" "),
        errorId,
        errorText: errorId
          ? document.getElementById(errorId)?.textContent ?? null
          : null,
        invalid: name.getAttribute("aria-invalid"),
      });
    });

    await user.click(within(form).getByRole("button", { name: "Send message" }));

    expect(emailjs.send).not.toHaveBeenCalled();
    expect(name).toHaveFocus();
    expect(focusSnapshots).toHaveLength(1);
    expect(focusSnapshots[0].invalid).toBe("true");
    expect(focusSnapshots[0].errorId).toBeTruthy();
    expect(focusSnapshots[0].describedBy).toContain(
      focusSnapshots[0].errorId,
    );
    expect(focusSnapshots[0].errorText).toBe("Please enter your name.");
    expectSinglePoliteStatus(
      form,
      "Please correct the highlighted fields and try again.",
    );

    for (const [field, error] of [
      [name, "Please enter your name."],
      [contact, "Please enter your email or phone number."],
      [message, "Please enter a message."],
    ] as const) {
      const errorId = field.getAttribute("aria-errormessage");
      const describedBy = field.getAttribute("aria-describedby") ?? "";

      expect(field).toHaveAttribute("aria-invalid", "true");
      expect(errorId).toBeTruthy();
      expect(describedBy.split(" ")).toContain(errorId);
      expect(document.getElementById(errorId ?? "")).toHaveTextContent(error);
    }

    await user.clear(name);
    await user.type(name, "Ada");
    await user.click(within(form).getByRole("button", { name: "Send message" }));
    expect(contact).toHaveFocus();

    await user.clear(contact);
    await user.type(contact, "ada@example.com");
    await user.click(within(form).getByRole("button", { name: "Send message" }));
    expect(message).toHaveFocus();
    expect(emailjs.send).not.toHaveBeenCalled();
  });

  it("allows exactly one same-tick submission and exposes one busy sending state", async () => {
    const sending = createDeferred<ReturnType<typeof successfulResponse>>();
    emailjsSendMock.mockReturnValueOnce(sending.promise);
    const { contact, form, message, name, user } = renderContactForm();
    await fillRequiredFields(
      user,
      { contact, message, name },
      {
        name: "  Ada Lovelace  ",
        contact: "  ada@example.com  ",
        message: "  Please get in touch.  ",
      },
    );

    act(() => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });

    expect(emailjs.send).toHaveBeenCalledTimes(1);
    expect(emailjs.send).toHaveBeenCalledWith(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      {
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Please get in touch.",
      },
      emailjsConfig.publicKey,
    );
    const sendingButton = within(form).getByRole("button", {
      name: "Sending…",
    });
    const busyControls = sendingButton.closest('[aria-busy="true"]');
    const status = expectSinglePoliteStatus(form, "Sending your message…");

    expect(form).not.toHaveAttribute("aria-busy");
    expect(busyControls).not.toBeNull();
    expect(status.closest('[aria-busy="true"]')).toBeNull();
    expect(name).toBeDisabled();
    expect(contact).toBeDisabled();
    expect(message).toBeDisabled();
    expect(name).toHaveValue("  Ada Lovelace  ");
    expect(contact).toHaveValue("  ada@example.com  ");
    expect(message).toHaveValue("  Please get in touch.  ");
    expect(sendingButton).toBeDisabled();

    await act(async () => {
      sending.resolve(successfulResponse());
      await sending.promise;
    });
  });

  it("clears input only after confirmed success and announces completion", async () => {
    const sending = createDeferred<ReturnType<typeof successfulResponse>>();
    emailjsSendMock.mockReturnValueOnce(sending.promise);
    const { contact, form, message, name, user } = renderContactForm();
    await fillRequiredFields(user, { contact, message, name });

    await user.click(within(form).getByRole("button", { name: "Send message" }));

    expect(name).toHaveValue("Ada Lovelace");
    expect(contact).toHaveValue("ada@example.com");
    expect(message).toHaveValue("Let us build something useful.");

    sending.resolve(successfulResponse());

    await waitFor(() => {
      expectSinglePoliteStatus(
        form,
        "Your message has been sent. Thank you for getting in touch.",
      );
    });
    expect(form).not.toHaveAttribute("aria-busy");
    expect(
      within(form)
        .getByRole("button", { name: "Send message" })
        .closest('[aria-busy="false"]'),
    ).not.toBeNull();
    expect(name).toHaveValue("");
    expect(contact).toHaveValue("");
    expect(message).toHaveValue("");
    expect(within(form).getByRole("button", { name: "Send message" })).toBeEnabled();
  });

  it("returns a successful form to idle when the visitor starts a new message", async () => {
    const { contact, form, message, name, user } = renderContactForm();
    await fillRequiredFields(user, { contact, message, name });

    await user.click(within(form).getByRole("button", { name: "Send message" }));

    const status = await waitFor(() =>
      expectSinglePoliteStatus(
        form,
        "Your message has been sent. Thank you for getting in touch.",
      ),
    );
    await user.type(name, "Ada");

    expect(status).toBeEmptyDOMElement();
    expect(within(form).getAllByRole("status")).toHaveLength(1);
    expect(
      within(form).getByRole("button", { name: "Send message" }),
    ).toBeEnabled();
  });

  it("retains editable input after failure and supports a successful labeled retry", async () => {
    const failedAttempt = createDeferred<ReturnType<typeof successfulResponse>>();
    emailjsSendMock
      .mockReturnValueOnce(failedAttempt.promise)
      .mockResolvedValueOnce(successfulResponse());
    const { contact, form, message, name, user } = renderContactForm();
    await fillRequiredFields(user, { contact, message, name });

    await user.click(within(form).getByRole("button", { name: "Send message" }));
    failedAttempt.reject(new Error("EmailJS unavailable"));

    await waitFor(() => {
      expectSinglePoliteStatus(
        form,
        "Your message could not be sent. Please try again.",
      );
    });
    expect(form).not.toHaveAttribute("aria-busy");
    expect(
      within(form)
        .getByRole("button", { name: "Try again" })
        .closest('[aria-busy="false"]'),
    ).not.toBeNull();
    expect(name).toBeEnabled();
    expect(contact).toBeEnabled();
    expect(message).toBeEnabled();
    expect(name).toHaveValue("Ada Lovelace");
    expect(contact).toHaveValue("ada@example.com");
    expect(message).toHaveValue("Let us build something useful.");

    await user.clear(message);
    await user.type(message, "  Retrying with an updated message.  ");
    await user.click(within(form).getByRole("button", { name: "Try again" }));

    expect(emailjs.send).toHaveBeenCalledTimes(2);
    expect(emailjs.send).toHaveBeenLastCalledWith(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      {
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Retrying with an updated message.",
      },
      emailjsConfig.publicKey,
    );
    await waitFor(() => {
      expectSinglePoliteStatus(
        form,
        "Your message has been sent. Thank you for getting in touch.",
      );
    });
    expect(name).toHaveValue("");
    expect(contact).toHaveValue("");
    expect(message).toHaveValue("");
  });

  it("uses responsive token-based styles with minimum touch targets", () => {
    expect(contactFormCss).toMatch(/var\(--color-canvas\)/);
    expect(contactFormCss).toMatch(/var\(--color-surface\)/);
    expect(contactFormCss).toMatch(/var\(--color-text\)/);
    expect(contactFormCss).toMatch(/var\(--color-focus\)/);
    expect(contactFormCss).toMatch(/min-height:\s*44px/);
    expect(contactFormCss).toMatch(/@media\s*\(max-width:/);
  });
});
