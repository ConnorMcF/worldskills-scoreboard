using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Net.Sockets;
using System.Threading;
using System.Collections.Generic;

using CommandLine;

namespace WorldSkillsScoreboard
{
    public sealed class CommandLineOptions
    {
        [Option('h', "host", Required = false, HelpText = "Server hostname")]
        public string Host { get; set; }

        [Option('p', "port", Required = false, HelpText = "Server port", Default = 12345)]
        public int Port { get; set; }

        [Option('n', "name", Required = false, HelpText = "Display name")]
        public string Name { get; set; }

        [Option('P', "process", Required = false, HelpText = "PT process name", Default = "PacketTracer7")]
        public string PTProcess { get; set; }

        [Option('O', "offsets", Required = false, HelpText = "PT offsets", Default = "0x03B609E8,0x2F0,0x280")]
        public string PTOffsets { get; set; }
    }

    class Program
    {
        private static CommandLineOptions opts;

        /* socket */
        private static Socket sock = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

        /* read */
        const int PROCESS_WM_READ = 0x0010;

        /* kernel */
        [DllImport("kernel32.dll")]
        public static extern IntPtr OpenProcess(int dwDesiredAccess, bool bInheritHandle, int dwProcessId);

        /*[DllImport("kernel32.dll")]
        public static extern bool ReadProcessMemory(int hProcess, int lpBaseAddress, byte[] lpBuffer, int dwSize, ref int lpNumberOfBytesRead);*/

        [DllImport("kernel32.dll")]
        public static extern bool ReadProcessMemory(int hProcess, Int64 lpBaseAddress, byte[] lpBuffer, int dwSize, ref int lpNumberOfBytesRead);

        /* configured offsets */
        private static long CF_OFFSET_BASE;
        private static long CF_OFFSET_0;
        private static long CF_OFFSET_1;

        static void Main(string[] args)
        {
            Console.WriteLine("    ___  ______  __               __        __                    __ ");
            Console.WriteLine("   / _ \\/_  __/ / /  ___ ___ ____/ /__ ____/ /  ___  ___ ________/ / ");
            Console.WriteLine("  / ___/ / /   / /__/ -_) _ `/ _  / -_) __/ _ \\/ _ \\/ _ `/ __/ _  /  ");
            Console.WriteLine(" /_/    /_/   /____/\\__/\\_,_/\\_,_/\\__/_/ /_.__/\\___/\\_,_/_/  \\_,_/   ");
            Console.WriteLine("                                                                     ");

            Parser.Default.ParseArguments<CommandLineOptions>(args)
                .WithParsed(opts => Start(opts))
                .WithNotParsed((errs) => Complain(errs));
        }

        static void Start(CommandLineOptions options)
        {
            if(options != null)
            {
                opts = options;
            }

            if (opts.PTOffsets != null)
            {
                IList<string> offsets;

                string offset = String.Concat(opts.PTOffsets);
                offsets = offset.Split(",", StringSplitOptions.RemoveEmptyEntries);

                if(offsets.Count > 3)
                {
                    Console.WriteLine("[!] Too many offsets provided");
                    Environment.Exit(1);
                }
                if (offsets.Count < 3)
                {
                    Console.WriteLine("[!] Too few offsets provided");
                    Environment.Exit(1);
                }

                try
                {
                    CF_OFFSET_BASE = Convert.ToInt64(offsets[0], 16);
                    CF_OFFSET_0 = Convert.ToInt64(offsets[1], 16);
                    CF_OFFSET_1 = Convert.ToInt64(offsets[2], 16);
                }
                catch (System.FormatException)
                {
                    Console.WriteLine("[!] Offsets contain invalid hex");
                    Environment.Exit(1);
                }
            }

            if (
                opts.Host == null ||
                opts.Name == null
            )
            {
                Console.WriteLine("Tip: Launch with --help argument to automate\n");
            }

            if(opts.Host == null)
            {
                Console.WriteLine("[*] Leaderboard Host:");
                opts.Host = Console.ReadLine();
            }

            if (opts.Name == null)
            {
                Console.WriteLine("[*] Name:");
                opts.Name = Console.ReadLine();
            }

            Connect();
        }

        static void Complain(IEnumerable<Error> errors)
        {
            foreach(Error err in errors)
            {
                if(err is CommandLine.HelpRequestedError || err is CommandLine.VersionRequestedError)
                {
                    break;
                }

                Console.WriteLine(err);
            }
        }

        static void Connect()
        {
            Console.WriteLine("[.] Establishing connection..");

            // connect
            try {
                sock.Connect(opts.Host, opts.Port);
            } catch (SocketException se) {
                // or don't
                Console.WriteLine("Failed to connect to host! " + se.Message);

                Start(null);
                return;
            }

            Console.WriteLine("[.] Connected!");

            // send name to server
            SendData("name", opts.Name);

            BindProcess();
        }

        static void BindProcess()
        {
            Console.WriteLine("[.] Binding..");

            Process process;

            while (true)
            {
                // find PT
                Process[] processes = Process.GetProcessesByName(opts.PTProcess);

                if (processes.Length == 0)
                {
                    // or don't find PT
                    Console.WriteLine("[!] PT not detected!");
                    Console.WriteLine("[!] Waiting for {0} process..", opts.PTProcess);
                    while(true)
                    {
                        processes = Process.GetProcessesByName(opts.PTProcess);
                        if (processes.Length != 0)
                        {
                            break;
                        }

                        Thread.Sleep(1000);
                    }

                    continue;
                }

                process = processes[0];

                // sanity checks & warnings
                if (processes.Length > 1)
                {
                    Console.WriteLine("[!] ====== WARNING =====");
                    Console.WriteLine("[!] Multiple PT windows found ({0}), using first one: {1}", processes.Length, process.MainWindowTitle);
                    Console.WriteLine("[!] This may not be what you want, probably take a look");
                    Console.WriteLine("[!] ====================");
                }

                break;
            }

            ReadScore(process);
        }

        static void ReadScore(Process process)
        {
            
            // load PT handle
            IntPtr processHandle = OpenProcess(PROCESS_WM_READ, false, process.Id);

            // wait what
            if(process.HasExited)
            {
                Console.WriteLine("[!] Process preemptively died..");
                BindProcess();
                return;
            }

            Console.WriteLine("[~] Bound to PT at 0x{0} ({1})", process.MainModule.BaseAddress.ToString("X"), process.MainModule.FileName);

            // if PT updates, you die.
            IntPtr OFFSET_BASE = process.MainModule.BaseAddress + (int)CF_OFFSET_BASE;
            int OFFSET_0 = (int)CF_OFFSET_0;
            int OFFSET_1 = (int)CF_OFFSET_1;

            /* HOW TO FIX THESE - "I HAVE NO IDEA WHAT I'M DOING" EDITION:
             * 1) open cheat engine and PT (with an activity file)
             * 2) find address for score value (do a scan and change it a few times)
             * 3) do a pointer scan on the address (add to addr list, right click, 'do a pointerscan on this addr')
             * 4) look at clusterfuck in terror
             * 5) close (fully, check task manager!) PT and re-open it (with an activity file)
             * 6) repeat until pointer paths stop going down or you lose the will
             * 7) look for the address with the shortest offset which is pointing to 'PacketTracer7.exe' (should be two, as above)
             * 8) fill in the above consts with those values
             * 9) ???
             * 10) fixed
             * (recompile not needed, use --offset [base],[offs1],[offs2] at runtime)
            */

            int bytesRead = 0;

            // find base address ptr
            byte[] buffer1 = new byte[4];
            ReadProcessMemory((int)processHandle, (long)OFFSET_BASE, buffer1, buffer1.Length, ref bytesRead);

            // find first offset ptr
            byte[] buffer2 = new byte[4];
            ReadProcessMemory((int)processHandle, System.BitConverter.ToInt32(buffer1) + OFFSET_0, buffer2, buffer2.Length, ref bytesRead);

            // calculate value ptr
            long valuePtr = System.BitConverter.ToInt32(buffer2) + OFFSET_1;

            double currentScore = -1;
            uint tick = 0;

            while (true)
            {
                // did it die
                if(process.HasExited)
                {
                    break;
                }

                // read score
                byte[] buffer3 = new byte[8];
                ReadProcessMemory((int)processHandle, valuePtr, buffer3, buffer3.Length, ref bytesRead);

                double score = System.BitConverter.ToDouble(buffer3);

                // update score if changed
                if (currentScore != score)
                {
                    currentScore = score;

                    SendData("score", score.ToString());
                    Console.WriteLine("Current score: {0}", score);
                }

                // send keep-alive every 10 ticks
                if(tick % 10 == 0)
                {
                    SendData("alive", DateTime.UtcNow.ToOADate().ToString());
                }
                tick++;

                // recieve anything and check if sock is alive
                try
                {
                    if (sock.Available > 0)
                    {
                        byte[] messageReceived = new byte[1024];
                        int byteRecv = sock.Receive(messageReceived);
                    }
                }
                catch (SocketException se)
                {
                    Console.WriteLine("[!] SocketException: {0}", se.Message);
                    Console.ReadLine();
                    Environment.Exit(1);
                }

                Thread.Sleep(1000);
            }

            // it died
            BindProcess();
        }
        
        static void SendData(string key, string val)
        {
            // encode
            byte[] msg = Encoding.UTF8.GetBytes(key + "=" + val + "\n");

            // send
            try
            {
                int i = sock.Send(msg);
            }
            catch (SocketException se)
            {
                Console.WriteLine("[!] SocketException: {0}", se.Message);
                Console.ReadLine();
                Environment.Exit(1);
            }
        }
    }
}
