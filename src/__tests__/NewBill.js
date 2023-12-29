/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
  });
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });

    test("Then form inputs should be render correctly", () => {
      document.body.innerHTML = NewBillUI();
      const formNewBill = screen.getByTestId("form-new-bill");
      const type = screen.getAllByTestId("expense-type");
      const name = screen.getAllByTestId("expense-name");
      const date = screen.getAllByTestId("datepicker");
      const amount = screen.getAllByTestId("amount");
      const vat = screen.getAllByTestId("vat");
      const pct = screen.getAllByTestId("pct");
      const commentary = screen.getAllByTestId("commentary");
      const file = screen.getAllByTestId("file");
      const submitBtn = document.querySelector("#btn-send-bill");
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      expect(formNewBill).toBeTruthy();
      expect(type).toBeTruthy();
      expect(name).toBeTruthy();
      expect(date).toBeTruthy();
      expect(amount).toBeTruthy();
      expect(vat).toBeTruthy();
      expect(pct).toBeTruthy();
      expect(commentary).toBeTruthy();
      expect(file).toBeTruthy();
      expect(submitBtn).toBeTruthy();
    });
    describe("When A file with a correct format is upload", () => {
      test("Then, the  input accept the file with no error message ", async () => {
        const store = null;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        const fileInput = screen.getByTestId("file");
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
        fileInput.addEventListener("change", handleChangeFile);
        const file = new File(["img.jpg"], "imgTest.jpg", {
          type: "image/jpg",
        });
        fireEvent.change(fileInput, {
          target: {
            files: [file],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(fileInput.files[0].name).toBe("imgTest.jpg");
        expect(newBill.fileName).toBe("imgTest.jpg");
        expect(newBill.formData).toBeDefined();
        await waitFor(() => {
          const errorMsg = screen.getByTestId("error-input-file");
          expect(errorMsg.classList.contains("display-error-msg")).toBeFalsy();
        });
      });
    });

    describe("When A file with an incorrect format is upload", () => {
      test("Then, the file input value display no name with an error message ", async () => {
        document.body.innerHTML = NewBillUI();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = null;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        const fileInput = screen.getByTestId("file");
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
        fileInput.addEventListener("change", handleChangeFile);
        const file = new File(["img.jpg"], "imgTest.pdf", {
          type: "application/pdf",
        });
        fireEvent.change(fileInput, {
          target: {
            files: [file],
          },
        });
        expect(fileInput.value).toBe("");
        expect(handleChangeFile).toHaveBeenCalled();
        expect(newBill.fileName).toBeDefined();
        expect(newBill.formData).toBeUndefined();
        await waitFor(() => {
          const errorMsg = screen.getByTestId("error-input-file");
          expect(errorMsg.classList.contains("display-error-msg")).toBeTruthy();
        });
      });
    });
  });

  describe("When  I click on 'Envoyer'", () => {
    test("Then handleSubmit function is called", async () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = mockStore;
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });
      const updateSpy = jest.spyOn(mockStore.bills(), "update");

      const handleSubmit = jest.fn(() => newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
        expect(updateSpy).toHaveBeenCalled();
      });
    });
  });
  describe("When a user post a new bill", () => {
    test("Then a new bill is added through mock API POST ", async () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const bill = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl:
          "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };
      const store = mockStore;
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });
      const updateSpy = jest.spyOn(mockStore.bills(), "update");

      const handleSubmit = jest.fn(() => newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalled();
      });

      const postedBill = await mockStore.bills().update();
      expect(postedBill).toEqual(bill);
    });

    describe("When an error occurs on API", () => {
      test("fetches new bill to an API and fails with 404 message error", async () => {
        document.body.innerHTML = NewBillUI();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const spyOnConsole = jest.spyOn(console, "error");
        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error("404"))),
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });
        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        await waitFor(() => {
          expect(spyOnConsole).toBeCalledWith(new Error("404"));
        });
      });
      test("fetches new bill to an API and fails with 500 message error", async () => {
        document.body.innerHTML = NewBillUI();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const spyOnConsole = jest.spyOn(console, "error");
        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error("500"))),
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });
        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);
        waitFor(() => {
          expect(spyOnConsole).toBeCalledWith(new Error("500"));
        });
      });
    });
  });
});
